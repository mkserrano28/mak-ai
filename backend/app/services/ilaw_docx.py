from io import BytesIO

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import (
    WD_TABLE_ALIGNMENT,
    WD_CELL_VERTICAL_ALIGNMENT,
)
from docx.enum.section import WD_SECTION, WD_ORIENT
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


# ============================================================
# COLORS
# ============================================================

ILAW_GREEN = "00B050"
LIGHT_GREEN = "D9EAD3"
MEDIUM_GREEN = "93D977"
WHITE = "FFFFFF"
BLACK = "000000"


# ============================================================
# MAIN DOCX GENERATOR
# ============================================================

def generate_ilaw_docx(lesson_plan: dict) -> BytesIO:

    document = Document()

    section = document.sections[0]

    section.orientation = WD_ORIENT.LANDSCAPE

    section.page_width = Inches(11)
    section.page_height = Inches(8.5)

    section.top_margin = Inches(0.35)
    section.bottom_margin = Inches(0.35)
    section.left_margin = Inches(0.35)
    section.right_margin = Inches(0.35)

    # --------------------------------------------------------
    # DEFAULT FONT
    # --------------------------------------------------------

    styles = document.styles

    normal = styles["Normal"]
    normal.font.name = "Arial"
    normal.font.size = Pt(9)

    # --------------------------------------------------------
    # DATA
    # --------------------------------------------------------

    info = lesson_plan.get(
        "lesson_information",
        {},
    )

    references = lesson_plan.get(
        "references",
        [],
    )

    declaration = lesson_plan.get(
        "declaration_of_ai_use",
        "",
    )

    intentions = lesson_plan.get(
        "intentions",
        {},
    )

    experiences = lesson_plan.get(
        "learning_experiences",
        {},
    )

    assessment = lesson_plan.get(
        "assessment",
        {},
    )

    ways_forward = lesson_plan.get(
        "ways_forward",
        {},
    )

    prepared = lesson_plan.get(
        "prepared_checked_noted",
        {},
    )

    # ========================================================
    # TITLE
    # ========================================================

    title_table = document.add_table(
        rows=1,
        cols=1,
    )

    title_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    title_table.autofit = False

    title_cell = title_table.cell(0, 0)

    shade_cell(
        title_cell,
        ILAW_GREEN,
    )

    set_cell_text(
        title_cell,
        "Lesson Plan - ILAW Format",
        bold=True,
        size=11,
        align=WD_ALIGN_PARAGRAPH.CENTER,
    )

    set_cell_width(
        title_cell,
        7.57,
    )

    # Small spacing
    document.add_paragraph().paragraph_format.space_after = Pt(0)

    # ========================================================
    # LESSON INFORMATION
    # ========================================================

    add_section_header(
        document,
        "LESSON INFORMATION",
    )

    info_table = document.add_table(
        rows=5,
        cols=2,
    )

    info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    info_table.autofit = False

    info_rows = [
        (
            "Lesson Title",
            info.get("title", ""),
        ),
        (
            "Learning Area/s",
            info.get("learning_area", ""),
        ),
        (
            "Name of Teacher/s",
            ", ".join(
                info.get("teachers", [])
            ),
        ),
        (
            "Grade Level and Section",
            build_grade_section(info),
        ),
        (
            "No. of Sessions",
            str(info.get("sessions", "")),
        ),
        
    ]

    for row_index, (label, value) in enumerate(
        info_rows
    ):

        left = info_table.cell(
            row_index,
            0,
        )

        right = info_table.cell(
            row_index,
            1,
        )

        shade_cell(
            left,
            LIGHT_GREEN,
        )

        set_cell_text(
            left,
            label,
            bold=True,
            size=8,
        )

        set_cell_text(
            right,
            value,
            size=9,
        )

        set_cell_width(
            left,
            1.85,
        )

        set_cell_width(
            right,
            5.72,
        )

    set_table_borders(
        info_table,
    )

    # ========================================================
    # SESSIONS
    # ========================================================

    session_items = lesson_plan.get("sessions", [])
    session_count = len(session_items)

    if session_count <= 0:
        session_count = int(info.get("sessions", 0) or 0)

    if session_count > 0:
        sessions_table = document.add_table(
            rows=1,
            cols=session_count + 1,
        )

        sessions_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        sessions_table.autofit = False
        set_table_width(sessions_table, 7.57)

        # First cell: Sessions
        cell = sessions_table.cell(0, 0)
        shade_cell(cell, MEDIUM_GREEN)
        set_cell_text(
            cell,
            "Sessions",
            bold=True,
            size=8,
            align=WD_ALIGN_PARAGRAPH.CENTER,
        )
        set_cell_width(cell, 1.85)

        # Remaining cells: Session 1 ... Session N
        session_width = (7.57 - 1.85) / session_count

        for index in range(session_count):
            cell = sessions_table.cell(0, index + 1)
            shade_cell(cell, MEDIUM_GREEN)
            set_cell_text(
                cell,
                f"Session {index + 1}",
                bold=True,
                size=8,
                align=WD_ALIGN_PARAGRAPH.CENTER,
            )
            set_cell_width(cell, session_width)

        set_table_borders(sessions_table)

    # ========================================================
    # REFERENCES
    # ========================================================

    add_section_header(
        document,
        "References (books, websites, toolkits, etc.)",
    )

    references_table = document.add_table(
        rows=1,
        cols=2,
    )

    references_table.alignment = (
        WD_TABLE_ALIGNMENT.CENTER
    )

    references_table.autofit = False

    ref_left = references_table.cell(0, 0)
    ref_right = references_table.cell(0, 1)

    shade_cell(
        ref_left,
        LIGHT_GREEN,
    )

    set_cell_text(
        ref_left,
        "References (books,\nwebsites, toolkits,\netc.)",
        bold=False,
        size=8,
    )

    set_cell_width(
        ref_left,
        1.85,
    )

    set_cell_width(
        ref_right,
        5.72,
    )

    add_list_to_cell(
        ref_right,
        references,
    )

    set_table_borders(
        references_table,
    )

    # ========================================================
    # DECLARATION OF AI USE
    # ========================================================

    ai_table = document.add_table(
        rows=1,
        cols=2,
    )

    ai_table.alignment = (
        WD_TABLE_ALIGNMENT.CENTER
    )

    ai_table.autofit = False

    ai_left = ai_table.cell(0, 0)
    ai_right = ai_table.cell(0, 1)

    shade_cell(
        ai_left,
        LIGHT_GREEN,
    )

    set_cell_text(
        ai_left,
        "Declaration of AI Use",
        bold=True,
        size=8,
    )

    set_cell_width(
        ai_left,
        1.85,
    )

    set_cell_width(
        ai_right,
        5.72,
    )

    set_cell_text(
        ai_right,
        declaration,
        size=8,
    )

    set_table_borders(
        ai_table,
    )

    # ========================================================
    # I - INTENTIONS
    # ========================================================

    add_section_header(
        document,
        "I - INTENTIONS",
        subtitle=(
            "Meaningful learning experiences are anchored "
            "in how we frame them. Start by deciding what "
            "you want learners to master by the end of "
            "the lesson."
        ),
    )

    intentions_table = document.add_table(
        rows=1,
        cols=2,
    )

    intentions_table.alignment = (
        WD_TABLE_ALIGNMENT.CENTER
    )

    intentions_table.autofit = False

    left = intentions_table.cell(0, 0)
    right = intentions_table.cell(0, 1)

    shade_cell(
        left,
        LIGHT_GREEN,
    )

    set_cell_text(
        left,
        "Learning Competencies\n\n"
        "Write the competencies from the curriculum "
        "that are targeted, and the content or "
        "performance standards applicable to the sessions.",
        size=7,
    )

    set_cell_width(
        left,
        1.85,
    )

    set_cell_width(
        right,
        5.72,
    )

    add_label_value(
        right,
        "Content Standard",
        intentions.get(
            "content_standard",
            "",
        ),
    )

    add_label_value(
        right,
        "Performance Standard",
        intentions.get(
            "performance_standard",
            "",
        ),
    )

    add_list_label_value(
        right,
        "Learning Competencies",
        intentions.get(
            "learning_competencies",
            [],
        ),
    )

    add_list_label_value(
        right,
        "Specific Objectives",
        intentions.get(
            "specific_objectives",
            [],
        ),
    )

    add_label_value(
        right,
        "Learning Objectives",
        intentions.get(
            "learning_objectives",
            "",
        ),
    )

    add_label_value(
        right,
        "Learner Context",
        intentions.get(
            "learner_context",
            "",
        ),
    )

    set_table_borders(
        intentions_table,
    )

    # ========================================================
    # L - LEARNING EXPERIENCES
    # ========================================================

    add_section_header(
        document,
        "L - LEARNING EXPERIENCES",
        subtitle=(
            "A learning experience is like a thoughtfully "
            "designed journey. Each activity and interaction "
            "builds towards meaningful understanding and growth."
        ),
    )

    # Learning Resources
    learning_resource_table = document.add_table(
        rows=1,
        cols=2,
    )

    learning_resource_table.alignment = (
        WD_TABLE_ALIGNMENT.CENTER
    )

    learning_resource_table.autofit = False

    left = learning_resource_table.cell(0, 0)
    right = learning_resource_table.cell(0, 1)

    shade_cell(
        left,
        LIGHT_GREEN,
    )

    set_cell_text(
        left,
        "Learning Resources",
        bold=True,
        size=8,
    )

    set_cell_text(
        right,
        experiences.get(
            "learning_resources",
            "",
        ),
        size=9,
    )

    set_cell_width(
        left,
        1.85,
    )

    set_cell_width(
        right,
        5.72,
    )

    set_table_borders(
        learning_resource_table,
    )

    # Pre-Lesson
    pre_table = document.add_table(
        rows=1,
        cols=2,
    )

    pre_table.alignment = (
        WD_TABLE_ALIGNMENT.CENTER
    )

    pre_table.autofit = False

    left = pre_table.cell(0, 0)
    right = pre_table.cell(0, 1)

    shade_cell(
        left,
        LIGHT_GREEN,
    )

    set_cell_text(
        left,
        "Pre-Lesson",
        bold=True,
        size=8,
    )

    set_cell_text(
        right,
        experiences.get(
            "pre_lesson",
            "",
        ),
        size=8,
    )

    set_cell_width(
        left,
        1.85,
    )

    set_cell_width(
        right,
        5.72,
    )

    set_table_borders(
        pre_table,
    )

    # Flow / Daylong
    flow = experiences.get(
        "flow_daylong",
        {},
    )

    flow_table = document.add_table(
        rows=1,
        cols=2,
    )

    flow_table.alignment = (
        WD_TABLE_ALIGNMENT.CENTER
    )

    flow_table.autofit = False

    left = flow_table.cell(0, 0)
    right = flow_table.cell(0, 1)

    shade_cell(
        left,
        LIGHT_GREEN,
    )

    set_cell_text(
        left,
        "Flow / Daylong",
        bold=True,
        size=8,
    )

    add_label_value(
        right,
        "Activity",
        flow.get(
            "activity",
            "",
        ),
    )

    add_label_value(
        right,
        "Discussion",
        flow.get(
            "discussion",
            "",
        ),
    )

    add_label_value(
        right,
        "Deduction / Generalization",
        flow.get(
            "deduction",
            "",
        ),
    )

    add_list_label_value(
        right,
        "Concepts",
        flow.get(
            "concepts",
            [],
        ),
    )

    set_cell_width(
        left,
        1.85,
    )

    set_cell_width(
        right,
        5.72,
    )

    set_table_borders(
        flow_table,
    )

    # Integration
    integration_table = document.add_table(
        rows=1,
        cols=2,
    )

    integration_table.alignment = (
        WD_TABLE_ALIGNMENT.CENTER
    )

    integration_table.autofit = False

    left = integration_table.cell(0, 0)
    right = integration_table.cell(0, 1)

    shade_cell(
        left,
        LIGHT_GREEN,
    )

    set_cell_text(
        left,
        "Opportunities for Integration",
        bold=True,
        size=8,
    )

    set_cell_text(
        right,
        experiences.get(
            "opportunities_for_integration",
            "",
        ),
        size=8,
    )

    set_cell_width(
        left,
        1.85,
    )

    set_cell_width(
        right,
        5.72,
    )

    set_table_borders(
        integration_table,
    )
    # ========================================================
    # A - ASSESSMENT
    # ========================================================

    paragraph = document.add_paragraph()
    paragraph.paragraph_format.space_before = Pt(0)
    paragraph.paragraph_format.space_after = Pt(2)

    add_section_header(
        document,
        "A - ASSESSMENT",
        subtitle=(
            "Assessments reveal what learners have gained "
            "and what they still need help with."
        ),
    )

    assessment_table = document.add_table(
        rows=1,
        cols=2,
    )

    assessment_table.alignment = (
        WD_TABLE_ALIGNMENT.CENTER
    )

    assessment_table.autofit = False

    left = assessment_table.cell(0, 0)
    right = assessment_table.cell(0, 1)

    shade_cell(
        left,
        LIGHT_GREEN,
    )

    set_cell_text(
        left,
        "Formative Assessment",
        bold=True,
        size=8,
    )

    add_label_value(
        right,
        "Formative Assessment",
        assessment.get(
            "formative_assessment",
            "",
        ),
    )

    add_list_label_value(
        right,
        "Guide Questions",
        assessment.get(
            "guide_questions",
            [],
        ),
    )

    for row in assessment_table.rows:

        set_cell_width(
            row.cells[0],
            1.85,
        )

        set_cell_width(
            row.cells[1],
            5.72,
        )

    set_table_borders(
        assessment_table,
    )

    # ========================================================
    # W - WAYS FORWARD
    # ========================================================

    add_section_header(
        document,
        "W - WAYS FORWARD",
        subtitle=(
            "Meaningful learning can happen beyond the "
            "classroom - for both the learners and teacher."
        ),
    )

    ways_table = document.add_table(
        rows=2,
        cols=2,
    )

    ways_table.alignment = (
        WD_TABLE_ALIGNMENT.CENTER
    )

    ways_table.autofit = False

    ways_rows = [
        (
            "Extended Learning",
            "Opportunities",
            "Suggest other learning experiences outside the "
            "classroom/ class hours that learners may want to "
            "access to reinforce what they have learned, to "
            "spark their curiosities, or that may provide them "
            "support in their areas of difficulty.",
        ),
        (
            "Reflections",
            "",
            "Think about what you need to change for the next "
            "session based on what happened today. Is there "
            "something the learners are interested in exploring? "
            "Are there some things you would like to share with "
            "your co-teachers, parents, or school leaders about "
            "your classroom experience? What would you like your "
            "instructional coach to help you with?\n\n"
            "Reflections may be written in brief notes, bullets, "
            "or annotations.",
        ),
    ]

    for index, (label, sublabel, instruction) in enumerate(ways_rows):

        left = ways_table.cell(
            index,
            0,
        )

        right = ways_table.cell(
            index,
            1,
        )

        shade_cell(
            left,
            LIGHT_GREEN,
        )

        # Left column contains the official guidance.
        left.text = ""

        paragraph = left.paragraphs[0]
        paragraph.paragraph_format.space_after = Pt(0)

        run = paragraph.add_run(label)
        run.bold = True
        run.font.name = "Arial"
        run.font.size = Pt(9)

        if sublabel:
            p = left.add_paragraph()
            p.paragraph_format.space_after = Pt(0)

            run = p.add_run(sublabel)
            run.bold = True
            run.font.name = "Arial"
            run.font.size = Pt(8)

        p = left.add_paragraph()
        p.paragraph_format.space_after = Pt(0)

        run = p.add_run(instruction)
        run.italic = True
        run.font.name = "Arial"
        run.font.size = Pt(7)

        # Right column is intentionally blank for the teacher.
        right.text = ""

        set_cell_width(
            left,
            1.85,
        )

        set_cell_width(
            right,
            5.72,
        )

        # Give the teacher enough writing space in the right column.
        row = ways_table.rows[index]
        tr_pr = row._tr.get_or_add_trPr()
        tr_height = OxmlElement("w:trHeight")
        tr_height.set(
            qn("w:val"),
            "1100" if index == 0 else "1400",
        )
        tr_height.set(qn("w:hRule"), "atLeast")
        tr_pr.append(tr_height)

    set_table_borders(
        ways_table,
    )

    # ========================================================
    # PREPARED / CHECKED / NOTED
    # ========================================================

    add_section_header(
        document,
        "PREPARED, CHECKED AND NOTED",
    )

    sign_table = document.add_table(
        rows=2,
        cols=3,
    )

    sign_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sign_table.autofit = False

    labels = [
        "Prepared by:",
        "Checked by:",
        "Noted:",
    ]

    values = [
        prepared.get("prepared_by", ""),
        prepared.get("checked_by", ""),
        prepared.get("noted_by", ""),
    ]

    roles = [
        "Teacher",
        "Master Teacher / Head Teacher",
        "School Principal",
    ]

    for column in range(3):

        header = sign_table.cell(0, column)
        body = sign_table.cell(1, column)

        # Header row: white, bold label.
        shade_cell(header, WHITE)
        set_cell_text(
            header,
            labels[column],
            bold=True,
            size=9,
        )

        # Body: name on top, role underneath.
        body.text = ""

        name_paragraph = body.paragraphs[0]
        name_paragraph.paragraph_format.space_before = Pt(8)
        name_paragraph.paragraph_format.space_after = Pt(2)

        name_run = name_paragraph.add_run(values[column])
        name_run.bold = True
        name_run.font.name = "Arial"
        name_run.font.size = Pt(9)

        role_paragraph = body.add_paragraph()
        role_paragraph.paragraph_format.space_before = Pt(0)
        role_paragraph.paragraph_format.space_after = Pt(4)

        role_run = role_paragraph.add_run(roles[column])
        role_run.font.name = "Arial"
        role_run.font.size = Pt(8)

        # Equal three-column layout across the ILAW width.
        set_cell_width(header, 2.52)
        set_cell_width(body, 2.52)

        header.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
        body.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP

    # Give the signature/body row enough vertical space.
    body_row = sign_table.rows[1]
    tr_pr = body_row._tr.get_or_add_trPr()
    tr_height = OxmlElement("w:trHeight")
    tr_height.set(qn("w:val"), "1200")
    tr_height.set(qn("w:hRule"), "atLeast")
    tr_pr.append(tr_height)

    set_table_borders(sign_table)

    # ========================================================
    # FINALIZE
    # ========================================================

    output = BytesIO()

    document.save(output)

    output.seek(0)

    return output


# ============================================================
# HELPERS
# ============================================================

def build_grade_section(info):

    grade = info.get(
        "grade_level",
        "",
    )

    section = info.get(
        "section",
        "",
    )

    if grade and section:
        return f"{grade} - {section}"

    return grade or section


def add_section_header(
    document,
    title,
    subtitle=None,
    width=7.57,
):

    table = document.add_table(
        rows=1,
        cols=1,
    )

    table.alignment = (
        WD_TABLE_ALIGNMENT.CENTER
    )

    table.autofit = False

    cell = table.cell(0, 0)

    shade_cell(
        cell,
        ILAW_GREEN,
    )

    cell.text = ""

    paragraph = cell.paragraphs[0]

    run = paragraph.add_run(
        title
    )

    run.bold = True
    run.font.name = "Arial"
    run.font.size = Pt(10)

    if subtitle:

        run = paragraph.add_run(
            "\n" + subtitle
        )

        run.italic = True
        run.font.name = "Arial"
        run.font.size = Pt(7)

    set_cell_width(
        cell,
        width,
    )

    set_table_width(
        table,
        width,
    )

    set_table_borders(
        table,
    )


def add_small_spacing(document):

    paragraph = document.add_paragraph()

    paragraph.paragraph_format.space_after = Pt(0)
    paragraph.paragraph_format.space_before = Pt(0)


def add_label_value(
    cell,
    label,
    value,
):

    paragraph = cell.add_paragraph()

    paragraph.paragraph_format.space_after = Pt(2)

    run = paragraph.add_run(
        f"{label}: "
    )

    run.bold = True
    run.font.name = "Arial"
    run.font.size = Pt(8)

    run = paragraph.add_run(
        str(value or "")
    )

    run.font.name = "Arial"
    run.font.size = Pt(8)


def add_list_label_value(
    cell,
    label,
    items,
):

    paragraph = cell.add_paragraph()

    paragraph.paragraph_format.space_after = Pt(1)

    run = paragraph.add_run(
        f"{label}:"
    )

    run.bold = True
    run.font.name = "Arial"
    run.font.size = Pt(8)

    for item in items or []:

        bullet = cell.add_paragraph(
            style="List Bullet"
        )

        # Move bullet content slightly to the right so the
        # bullet marker and text sit neatly inside the right column.
        bullet.paragraph_format.left_indent = Inches(0.28)
        bullet.paragraph_format.first_line_indent = Inches(-0.12)
        bullet.paragraph_format.space_after = Pt(0)

        run = bullet.add_run(
            str(item)
        )

        run.font.name = "Arial"
        run.font.size = Pt(8)


def add_list_to_cell(
    cell,
    items,
):

    cell.text = ""

    if not items:

        return

    for item in items:

        paragraph = cell.add_paragraph(
            style="List Bullet"
        )

        paragraph.paragraph_format.space_after = Pt(0)

        run = paragraph.add_run(
            str(item)
        )

        run.font.name = "Arial"
        run.font.size = Pt(8)


def set_cell_text(
    cell,
    text,
    bold=False,
    size=9,
    align=None,
):

    cell.text = ""

    paragraph = cell.paragraphs[0]

    paragraph.paragraph_format.space_after = Pt(0)
    paragraph.paragraph_format.space_before = Pt(0)

    if align is not None:
        paragraph.alignment = align

    run = paragraph.add_run(
        str(text or "")
    )

    run.bold = bold
    run.font.name = "Arial"
    run.font.size = Pt(size)

    cell.vertical_alignment = (
        WD_CELL_VERTICAL_ALIGNMENT.CENTER
    )


def set_cell_width(
    cell,
    width,
):

    cell.width = Inches(width)

    tc_pr = cell._tc.get_or_add_tcPr()

    tc_w = tc_pr.find(
        qn("w:tcW")
    )

    if tc_w is None:

        tc_w = OxmlElement(
            "w:tcW"
        )

        tc_pr.append(tc_w)

    tc_w.set(
        qn("w:w"),
        str(
            int(
                width * 1440
            )
        ),
    )

    tc_w.set(
        qn("w:type"),
        "dxa",
    )


def shade_cell(
    cell,
    color,
):

    tc_pr = cell._tc.get_or_add_tcPr()

    shd = tc_pr.find(
        qn("w:shd")
    )

    if shd is None:

        shd = OxmlElement(
            "w:shd"
        )

        tc_pr.append(shd)

    shd.set(
        qn("w:fill"),
        color,
    )


def set_table_width(
    table,
    width=7.57,
):

    """Force the entire table to a fixed width in inches."""

    table.autofit = False

    tbl_pr = table._tbl.tblPr

    tbl_w = tbl_pr.find(
        qn("w:tblW")
    )

    if tbl_w is None:

        tbl_w = OxmlElement(
            "w:tblW"
        )

        tbl_pr.append(tbl_w)

    tbl_w.set(
        qn("w:w"),
        str(
            int(
                width * 1440
            )
        ),
    )

    tbl_w.set(
        qn("w:type"),
        "dxa",
    )


def set_table_borders(
    table,
    color=BLACK,
    size="6",
):

    # Keep every ILAW table aligned to the same 7.57-inch content width.
    set_table_width(
        table,
        7.57,
    )

    tbl = table._tbl

    tbl_pr = tbl.tblPr

    borders = tbl_pr.first_child_found_in(
        "w:tblBorders"
    )

    if borders is None:

        borders = OxmlElement(
            "w:tblBorders"
        )

        tbl_pr.append(borders)

    for edge in (
        "top",
        "left",
        "bottom",
        "right",
        "insideH",
        "insideV",
    ):

        tag = f"w:{edge}"

        element = borders.find(
            qn(tag)
        )

        if element is None:

            element = OxmlElement(
                tag
            )

            borders.append(element)

        element.set(
            qn("w:val"),
            "single",
        )

        element.set(
            qn("w:sz"),
            size,
        )

        element.set(
            qn("w:space"),
            "0",
        )

        element.set(
            qn("w:color"),
            color,
        )


# ============================================================
# TEST / SAFETY
# ============================================================

if __name__ == "__main__":

    print(
        "ILAW DOCX generator loaded successfully."
    )