from app.services.ilaw_docx import generate_ilaw_docx


test_plan = {
    "lesson_information": {
        "title": "Human Person in a Society",
        "learning_area": "Introduction to Philosophy",
        "teachers": ["Teacher"],
        "grade_level": "Grade 12",
        "section": "",
        "sessions": 5,
    },

    "references": [
        "DepEd Curriculum Guide",
        "Module 7",
    ],

    "declaration_of_ai_use": (
        "AI was used to assist in generating "
        "the lesson plan."
    ),

    "intentions": {
        "content_standard": (
            "Learners understand the human person."
        ),
        "performance_standard": (
            "Learners demonstrate understanding."
        ),
        "learning_competencies": [
            "Explain human relationships."
        ],
        "specific_objectives": [
            "Identify social relationships.",
            "Analyze social systems.",
        ],
        "learning_objectives": (
            "Understand the role of society."
        ),
        "learner_context": (
            "Grade 12 learners."
        ),
    },

    "learning_experiences": {
        "learning_resources": "Slides and modules",
        "pre_lesson": "Review previous lesson.",
        "flow_daylong": {
            "activity": "Group activity",
            "discussion": "Class discussion",
            "deduction": "Generalization",
            "concepts": [
                "Society",
                "Relationships",
            ],
        },
        "opportunities_for_integration": (
            "Values Education"
        ),
    },

    "sessions": [
        {
            "session_number": 1,
            "topic": "Understanding the Human Person",
            "activities": "Interactive discussion, concept mapping, and guided reflection.",
            "assessment": "Short reflection activity.",
            "details": "",
        },
        {
            "session_number": 2,
            "topic": "Human Person and Society",
            "activities": "Group discussion and collaborative activity.",
            "assessment": "Group presentation.",
            "details": "",
        },
        {
            "session_number": 3,
            "topic": "Human Relationships",
            "activities": "Case analysis and small-group discussion.",
            "assessment": "Written analysis of a given scenario.",
            "details": "",
        },
        {
            "session_number": 4,
            "topic": "Philosophical Reflection",
            "activities": "Guided philosophical dialogue and individual reflection.",
            "assessment": "Reflection paper.",
            "details": "",
        },
        {
            "session_number": 5,
            "topic": "Integration and Application",
            "activities": "Synthesis activity and classroom discussion.",
            "assessment": "Performance task and short assessment.",
            "details": "",
        },
    ],

    "assessment": {
        "formative_assessment": (
            "Short reflection"
        ),
        "guide_questions": [
            "Why are relationships important?",
            "How does society influence people?",
        ],
    },

    "ways_forward": {
        "extended_learning": (
            "Observe relationships in your community."
        ),
        "reflections": (
            "Reflect on the lesson."
        ),
        "application": (
            "Apply the lesson to daily life."
        ),
    },

    "prepared_checked_noted": {
        "prepared_by": "Teacher",
        "checked_by": "Master Teacher",
        "noted_by": "School Principal",
    },
}


document = generate_ilaw_docx(test_plan)

with open(
    "test_ilaw.docx",
    "wb",
) as file:
    file.write(document.getvalue())


print("✅ DOCX generation successful")
print("Created: test_ilaw.docx")