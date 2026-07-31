from datetime import datetime, timedelta, timezone
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    decode_access_token,
    generate_verification_code,
    hash_password,
    hash_verification_code,
    verify_password,
    verify_verification_code,
)
from app.database.database import get_db
from app.database.models import User
from app.services.email_service import send_verification_email


router = APIRouter()
bearer_scheme = HTTPBearer()

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class RegisterResponse(BaseModel):
    message: str
    email: str


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    email = data.email.lower().strip()
    name = data.name.strip()

    if len(name) < 2:
        raise HTTPException(
            status_code=400,
            detail="Name must contain at least 2 characters.",
        )

    if len(data.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 8 characters.",
        )

    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists.",
        )

    verification_code = generate_verification_code()

    user = User(
        name=name,
        email=email,
        password_hash=hash_password(data.password),
        is_verified=False,
        verification_code_hash=hash_verification_code(
            verification_code
        ),
        verification_code_expires_at=(
            datetime.now(timezone.utc)
            + timedelta(minutes=10)
        ),
        subscription_plan="free",
        subscription_status="active",
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # DEVELOPMENT ONLY
    # We'll replace this with the email provider next.
    send_verification_email(
        user.email,
        verification_code,
    )

    return {
        "message": "Account created. Please verify your email.",
        "email": user.email,
    }

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str


@router.post("/verify-email")
def verify_email(
    data: VerifyEmailRequest,
    db: Session = Depends(get_db),
):
    email = data.email.lower().strip()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    if user.is_verified:
        return {
            "message": "Email is already verified."
        }

    if (
        not user.verification_code_hash
        or not user.verification_code_expires_at
    ):
        raise HTTPException(
            status_code=400,
            detail="No active verification code.",
        )

    expires_at = user.verification_code_expires_at

    # PostgreSQL may return a timezone-aware datetime.
    # SQLite/dev configurations may return a naive datetime.
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(
            status_code=400,
            detail="Verification code has expired.",
        )

    if not verify_verification_code(
        data.code,
        user.verification_code_hash,
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid verification code.",
        )

    user.is_verified = True
    user.verification_code_hash = None
    user.verification_code_expires_at = None

    db.commit()

    return {
        "message": "Email verified successfully."
    }

class ResendVerificationRequest(BaseModel):
    email: EmailStr


@router.post("/resend-verification")
def resend_verification(
    data: ResendVerificationRequest,
    db: Session = Depends(get_db),
):
    email = data.email.lower().strip()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    if user.is_verified:
        return {
            "message": "Email is already verified."
        }

    verification_code = generate_verification_code()

    user.verification_code_hash = (
        hash_verification_code(verification_code)
    )

    user.verification_code_expires_at = (
        datetime.now(timezone.utc)
        + timedelta(minutes=10)
    )

    db.commit()

    # DEVELOPMENT ONLY
    print(
        f"New Mak-AI verification code for {user.email}: "
        f"{verification_code}"
    )

    return {
        "message": "A new verification code has been generated."
    }

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


@router.post(
    "/login",
    response_model=LoginResponse,
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    email = data.email.lower().strip()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    if not verify_password(
        data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password.",
        )

    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before signing in.",
        )

    access_token = create_access_token(user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "subscription_plan": user.subscription_plan,
        },
    }


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
    db: Session = Depends(get_db),
):
    payload = decode_access_token(
        credentials.credentials
    )

    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token.",
        )

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token.",
        )

    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token.",
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found.",
        )

    return user


@router.get("/me")
def get_me(
    user: User = Depends(get_current_user),
):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "is_verified": user.is_verified,
        "subscription_plan": user.subscription_plan,
        "subscription_status": user.subscription_status,
    }