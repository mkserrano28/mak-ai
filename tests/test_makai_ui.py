from playwright.sync_api import Page, expect
from pathlib import Path

BASE_URL = "http://127.0.0.1:8501"


def test_makai_opens(page: Page):
    page.goto(BASE_URL)

    # Change this text only if your Mak-AI homepage uses different text.
    expect(page.get_by_text("How can I help you today?")).to_be_visible()

def test_chat_input_is_visible(page: Page):
    page.goto(BASE_URL)

    expect(
        page.get_by_placeholder("Ask Mak-AI...")
    ).to_be_visible()

def test_typing_message_enables_send_button(page: Page):
    page.goto(BASE_URL)

    chat_input = page.get_by_placeholder("Ask Mak-AI...")
    send_button = page.get_by_role("button", name="Send message")

    # At first, no message is typed, so Send is disabled.
    expect(send_button).to_be_disabled()

    # Simulate the user typing in the chat box.
    chat_input.fill("What is RAG?")

    # After typing, Send should be enabled.
    expect(send_button).to_be_enabled()

def test_user_can_send_message(page: Page):
    page.goto(BASE_URL)

    message = "What is RAG?"

    chat_input = page.get_by_placeholder("Ask Mak-AI...")
    send_button = page.get_by_role("button", name="Send message")

    # Type a message.
    chat_input.fill(message)

    # Click the enabled Send button.
    send_button.click()

    # Verify the user's message appears in the conversation.
    expect(page.get_by_text(message, exact=True)).to_be_visible()

def test_ai_response_appears_after_sending_message(page: Page):
    page.goto(BASE_URL)

    message = "Explain RAG in one sentence."

    chat_input = page.get_by_placeholder("Ask Mak-AI...")
    send_button = page.get_by_role("button", name="Send message")

    chat_input.fill(message)
    send_button.click()

    expect(
        page.get_by_text(
            "TEST_RESPONSE: RAG answer generated successfully.",
            exact=True,
        )
    ).to_be_visible(timeout=10000)

from pathlib import Path


def test_user_can_upload_text_file(page: Page):
    page.goto(BASE_URL)

    test_file = Path("tests/fixtures/sample.txt")

    file_input = page.locator('input[type="file"]')
    file_input.set_input_files(test_file)

    # Browser confirms the file is attached to the uploader.
    uploaded_file_count = file_input.evaluate(
        "(input) => input.files.length"
    )

    uploaded_file_name = file_input.evaluate(
        "(input) => input.files[0].name"
    )

    assert uploaded_file_count == 1
    assert uploaded_file_name == "sample.txt"

def test_user_can_upload_file_and_receive_ai_response(page: Page):
    page.goto(BASE_URL)

    # 1. Upload a test document.
    test_file = Path("tests/fixtures/sample.txt")
    file_input = page.locator('input[type="file"]')
    file_input.set_input_files(test_file)

    # Confirm the browser attached the file.
    uploaded_file_name = file_input.evaluate(
        "(input) => input.files[0].name"
    )
    assert uploaded_file_name == "sample.txt"

    # 2. Ask a question.
    message = "What skills are in this document?"

    chat_input = page.get_by_placeholder("Ask Mak-AI...")
    send_button = page.get_by_role("button", name="Send message")

    chat_input.fill(message)
    send_button.click()

    # 3. Verify the user message appears.
    expect(
        page.get_by_text(message, exact=True)
    ).to_be_visible()

    # 4. Verify the fake TEST_MODE response appears.
    expect(
        page.get_by_text(
            "TEST_RESPONSE: RAG answer generated successfully.",
            exact=True,
        )
    ).to_be_visible(timeout=10000)