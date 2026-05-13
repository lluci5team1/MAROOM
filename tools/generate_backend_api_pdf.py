from __future__ import annotations

import os
from datetime import date
from html import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT = os.path.join(ROOT, "docs", "maroom-backend-api-guide.pdf")

ACCENT = colors.HexColor("#1F7A8C")
DARK = colors.HexColor("#243B53")
MUTED = colors.HexColor("#52606D")
LIGHT = colors.HexColor("#F4F7FA")
LINE = colors.HexColor("#D9E2EC")
CODE_BG = colors.HexColor("#F7FAFC")


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            "CoverTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=26,
            leading=31,
            textColor=DARK,
            alignment=TA_CENTER,
            spaceAfter=12,
        )
    )
    styles.add(
        ParagraphStyle(
            "CoverSub",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=11,
            leading=16,
            textColor=MUTED,
            alignment=TA_CENTER,
            spaceAfter=4,
        )
    )
    styles.add(
        ParagraphStyle(
            "H1",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=17,
            leading=21,
            textColor=DARK,
            spaceBefore=12,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            "H2",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12.5,
            leading=16,
            textColor=ACCENT,
            spaceBefore=10,
            spaceAfter=5,
        )
    )
    styles.add(
        ParagraphStyle(
            "Body",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=9.2,
            leading=13,
            textColor=colors.HexColor("#334E68"),
            spaceAfter=5,
        )
    )
    styles.add(
        ParagraphStyle(
            "Small",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=8,
            leading=10.5,
            textColor=MUTED,
            spaceAfter=3,
        )
    )
    styles.add(
        ParagraphStyle(
            "TableHeader",
            parent=styles["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=7.7,
            leading=9.5,
            textColor=colors.white,
            alignment=TA_LEFT,
        )
    )
    styles.add(
        ParagraphStyle(
            "TableCell",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=7.5,
            leading=9.4,
            textColor=colors.HexColor("#334E68"),
        )
    )
    styles.add(
        ParagraphStyle(
            "TableCellBold",
            parent=styles["TableCell"],
            fontName="Helvetica-Bold",
            textColor=DARK,
        )
    )
    styles.add(
        ParagraphStyle(
            "CodeBlock",
            parent=styles["Code"],
            fontName="Courier",
            fontSize=7.1,
            leading=9.1,
            textColor=colors.HexColor("#102A43"),
            leftIndent=0,
            rightIndent=0,
            spaceBefore=2,
            spaceAfter=6,
        )
    )
    return styles


S = build_styles()


def para(text: str, style: str = "Body") -> Paragraph:
    return Paragraph(text, S[style])


def cell(text: str, bold: bool = False) -> Paragraph:
    return Paragraph(escape(text).replace("\n", "<br/>"), S["TableCellBold" if bold else "TableCell"])


def h1(text: str) -> Paragraph:
    return Paragraph(escape(text), S["H1"])


def h2(text: str) -> Paragraph:
    return Paragraph(escape(text), S["H2"])


def bullets(items: list[str]):
    return ListFlowable(
        [ListItem(Paragraph(escape(item), S["Body"]), leftIndent=11) for item in items],
        bulletType="bullet",
        start="circle",
        leftIndent=14,
        bulletFontName="Helvetica",
        bulletFontSize=7,
        bulletOffsetY=1,
    )


def code_block(text: str):
    block = Preformatted(text.strip("\n"), S["CodeBlock"])
    return Table(
        [[block]],
        colWidths=[6.68 * inch],
        style=[
            ("BACKGROUND", (0, 0), (-1, -1), CODE_BG),
            ("BOX", (0, 0), (-1, -1), 0.35, LINE),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ],
    )


def table(headers: list[str], rows: list[list[str]], widths: list[float]):
    data = [[Paragraph(escape(h), S["TableHeader"]) for h in headers]]
    data.extend([[cell(v) for v in row] for row in rows])
    t = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), ACCENT),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.35, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT]),
            ]
        )
    )
    return t


def endpoint(
    method: str,
    path: str,
    purpose: str,
    request: str | None = None,
    response: str | None = None,
    status: str | None = None,
    notes: list[str] | None = None,
):
    parts = [
        h2(f"{method} {path}"),
        table(
            ["Method", "Path", "Purpose"],
            [[method, path, purpose]],
            [0.72 * inch, 2.25 * inch, 3.71 * inch],
        ),
    ]
    if status:
        parts.append(para(f"<b>Status</b>: {escape(status)}", "Small"))
    if request:
        parts.extend([para("<b>Request</b>", "Small"), code_block(request)])
    if response:
        parts.extend([para("<b>Success response</b>", "Small"), code_block(response)])
    if notes:
        parts.extend([para("<b>Frontend notes</b>", "Small"), bullets(notes)])
    return KeepTogether(parts)


def header_footer(canvas, doc):
    canvas.saveState()
    page_w, page_h = LETTER
    canvas.setFillColor(colors.white)
    canvas.rect(0, 0, page_w, page_h, stroke=0, fill=1)
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.4)
    canvas.line(doc.leftMargin, page_h - 0.55 * inch, page_w - doc.rightMargin, page_h - 0.55 * inch)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(doc.leftMargin, page_h - 0.42 * inch, "MAROOM Backend API Guide")
    canvas.drawRightString(page_w - doc.rightMargin, 0.38 * inch, f"Page {doc.page}")
    canvas.restoreState()


def add_cover(story):
    story.append(Spacer(1, 1.2 * inch))
    story.append(Paragraph("MAROOM Backend API Guide", S["CoverTitle"]))
    story.append(Paragraph("Frontend Integration Reference", S["CoverSub"]))
    story.append(Spacer(1, 0.2 * inch))
    story.append(
        Table(
            [[
                para(
                    "Generated from the Spring backend controllers and DTOs in "
                    "<b>backend/src/main/java/com/maroom/maroom</b>.",
                    "Body",
                )
            ]],
            colWidths=[5.6 * inch],
            hAlign="CENTER",
            style=[
                ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
                ("BOX", (0, 0), (-1, -1), 0.6, LINE),
                ("LEFTPADDING", (0, 0), (-1, -1), 16),
                ("RIGHTPADDING", (0, 0), (-1, -1), 16),
                ("TOPPADDING", (0, 0), (-1, -1), 12),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
            ],
        )
    )
    story.append(Spacer(1, 0.24 * inch))
    story.append(Paragraph(f"Document date: {date.today().isoformat()}", S["CoverSub"]))
    story.append(Paragraph("Default local base URL: http://localhost:8080", S["CoverSub"]))
    story.append(PageBreak())


def build_story():
    story = []
    add_cover(story)

    story.append(h1("1. Integration Basics"))
    story.append(
        bullets(
            [
                "Base URL in the frontend client is process.env.EXPO_PUBLIC_API_URL, falling back to http://localhost:8080.",
                "Use Content-Type: application/json for request bodies.",
                "Login and signup return a bearer token. The current frontend interceptor sends Authorization: Bearer <token> automatically.",
                "Most domain endpoints still identify the active user by userId in the path/body. Token enforcement is not yet centralized.",
                "UUID fields are strings. Timestamps are ISO-8601 strings.",
                "Error bodies are not normalized yet: some endpoints return strings, some return maps such as {\"error\":\"...\"}, and uncaught exceptions may use Spring's default error payload.",
            ]
        )
    )

    story.append(h1("2. Endpoint Overview"))
    story.append(
        table(
            ["Area", "Method", "Endpoint", "Frontend use"],
            [
                ["Health", "GET", "/hello", "Backend availability check."],
                ["Auth", "POST", "/auth/signup", "Create account and receive token + userId."],
                ["Auth", "POST", "/auth/login", "Login and receive token + userId + onboarding flag."],
                ["Auth", "POST", "/auth/logout", "Delete current session token. Requires Authorization header."],
                ["Preferences", "GET", "/preferences/options", "Get allowed onboarding option values."],
                ["Preferences", "POST", "/preferences", "Save onboarding preferences."],
                ["Preferences", "GET", "/preferences/{userId}", "Load saved onboarding preferences."],
                ["Furniture", "GET", "/api/furniture-items", "List all furniture."],
                ["Furniture", "GET", "/api/furniture-items/search", "Explore search and filters."],
                ["Furniture", "GET", "/api/furniture-items/{id}", "Product detail page."],
                ["Furniture", "POST", "/api/furniture-items", "Internal/admin create item."],
                ["Swipe", "GET", "/swipe/feed/{userId}?size=20", "Recommended feed. Falls back to unswiped random items."],
                ["Swipe", "POST", "/swipe", "Record left/right swipe; RIGHT also saves to Liked."],
                ["Swipe", "GET", "/swipe/events/{userId}", "Debug/history view of user swipes."],
                ["Saved", "GET", "/saved/{userId}", "Saved products for the default Liked list."],
                ["Saved", "DELETE", "/saved/{userId}/{furnitureId}", "Remove a furniture item from Liked."],
                ["Saved", "GET", "/saved/lists/{userId}", "Fetch all custom saved lists."],
                ["Saved", "POST", "/saved/lists", "Create a saved list."],
                ["Saved", "GET", "/saved/items/{listId}", "Fetch raw saved items by list."],
                ["Saved", "POST", "/saved/items", "Add raw saved item to a list."],
                ["Internal", "POST", "/api/furniture/import/large", "Bulk import furniture data."],
                ["Internal", "POST", "/api/furniture-items/embeddings/backfill", "Backfill embedding vectors."],
                ["Internal", "POST", "/swipe/user-embedding/{userId}/recompute", "Recompute user embedding."],
                ["Users", "Mixed", "/users, /users/{id}", "Basic user CRUD-like helpers; treat as internal unless needed."],
            ],
            [0.82 * inch, 0.62 * inch, 2.25 * inch, 2.99 * inch],
        )
    )

    story.append(h1("3. Shared Shapes"))
    story.append(h2("FurnitureItem"))
    story.append(
        code_block(
            """
{
  "id": "uuid",
  "title": "Article Sven Sofa",
  "category": "Sofa",
  "brand": "Article",
  "style": "MODERN",
  "color": "Warm beige",
  "price": 1299,
  "roomType": "Living Room",
  "productUrl": "https://...",
  "imageUrl": "https://..."
}
"""
        )
    )
    story.append(h2("AuthResult"))
    story.append(
        code_block(
            """
{
  "token": "base64url-session-token",
  "userId": "uuid",
  "hasCompletedOnboarding": false
}
"""
        )
    )
    story.append(h2("Preference"))
    story.append(
        code_block(
            """
{
  "userId": "uuid",
  "homeType": "1_BEDROOM",
  "roomSize": "MEDIUM",
  "styles": "[\\"MODERN\\",\\"JAPANDI\\"]",
  "colorPalette": "[\\"WARM_NEUTRAL\\"]",
  "minBudget": 100,
  "maxBudget": 500
}
"""
        )
    )
    story.append(
        para(
            "Current backend response stores styles and colorPalette as JSON strings, not JSON arrays. "
            "Frontend should parse them if it needs array semantics.",
            "Small",
        )
    )

    story.append(PageBreak())

    story.append(h1("4. Auth APIs"))
    story.append(
        endpoint(
            "POST",
            "/auth/signup",
            "Create a local email user and start a session.",
            request="""
{
  "email": "new.user@example.com",
  "password": "plain-password",
  "displayName": "New User"
}
""",
            response="""
{
  "token": "P_sX...",
  "userId": "9fdc9d49-7b93-4ac7-b4e5-a9ad6f45d101",
  "hasCompletedOnboarding": false
}
""",
            status="200 OK on success. Duplicate email currently throws an uncaught IllegalArgumentException.",
            notes=["Store token and userId after success.", "Signup uses authProvider EMAIL internally."],
        )
    )
    story.append(
        endpoint(
            "POST",
            "/auth/login",
            "Login with email/password.",
            request="""
{
  "email": "new.user@example.com",
  "password": "plain-password"
}
""",
            response="""
{
  "token": "P_sX...",
  "userId": "9fdc9d49-7b93-4ac7-b4e5-a9ad6f45d101",
  "hasCompletedOnboarding": true
}
""",
            status="200 OK on success. Invalid credentials currently throw an uncaught IllegalArgumentException.",
            notes=["hasCompletedOnboarding is true when a Preference row exists for the user."],
        )
    )
    story.append(
        endpoint(
            "POST",
            "/auth/logout",
            "Delete the active session token.",
            request="Authorization: Bearer <token>",
            response='Logged out successfully',
            status='200 OK on success. 400 "Invalid token" if the header is missing or malformed.',
            notes=["Response is plain text, not JSON.", "No request body is required."],
        )
    )

    story.append(h1("5. Preferences / Onboarding APIs"))
    story.append(
        endpoint(
            "GET",
            "/preferences/options",
            "Return enum-like onboarding option values.",
            response="""
{
  "homeTypes": ["SINGLE_FAMILY_HOME", "1_BEDROOM", "2_BEDROOM", "DORM_STUDIO"],
  "roomSizes": ["SMALL", "MEDIUM", "LARGE"],
  "styles": ["MINIMALIST", "MODERN", "SCANDINAVIAN", "MID_CENTURY", "JAPANDI", "BOHO", "INDUSTRIAL"],
  "colorPalettes": ["WARM_NEUTRAL", "COOL_NEUTRAL", "EARTHY_TONES", "BLACK_WHITE", "VIBRANT", "PASTEL"],
  "budgetTiers": ["UNDER_100", "100_300", "300_500", "500_PLUS"]
}
""",
            status="200 OK",
        )
    )
    story.append(
        endpoint(
            "POST",
            "/preferences",
            "Create or update a user's onboarding preferences.",
            request="""
{
  "userId": "9fdc9d49-7b93-4ac7-b4e5-a9ad6f45d101",
  "homeType": "1_BEDROOM",
  "roomSize": "MEDIUM",
  "styles": ["MODERN", "JAPANDI"],
  "colorPalette": ["WARM_NEUTRAL"],
  "minBudget": 100,
  "maxBudget": 500
}
""",
            response="""
{
  "userId": "9fdc9d49-7b93-4ac7-b4e5-a9ad6f45d101",
  "homeType": "1_BEDROOM",
  "roomSize": "MEDIUM",
  "styles": "[\\"MODERN\\",\\"JAPANDI\\"]",
  "colorPalette": "[\\"WARM_NEUTRAL\\"]",
  "minBudget": 100,
  "maxBudget": 500
}
""",
            status="200 OK. 400 with a plain text validation message on invalid input.",
            notes=[
                "styles must contain 1 to 3 allowed values.",
                "colorPalette must contain 1 to 2 allowed values.",
                "minBudget and maxBudget are required and cannot be negative.",
            ],
        )
    )
    story.append(
        endpoint(
            "GET",
            "/preferences/{userId}",
            "Load one user's saved onboarding preferences.",
            response="Preference object",
            status="200 OK or 404 Not Found.",
        )
    )

    story.append(PageBreak())

    story.append(h1("6. Furniture APIs"))
    story.append(
        endpoint(
            "GET",
            "/api/furniture-items",
            "Return all furniture items.",
            response="[ FurnitureItem, ... ]",
            status="200 OK",
        )
    )
    story.append(
        endpoint(
            "GET",
            "/api/furniture-items/search",
            "Search and filter furniture items.",
            request="""
Query parameters:
q=sofa
brand=Article
category=Sofa&category=Chair
roomType=Living%20Room
color=warm%20beige
minPrice=100
maxPrice=1000
sortBy=price-low-to-high | price-high-to-low
""",
            response="[ FurnitureItem, ... ]",
            status="200 OK",
            notes=[
                "category, roomType, and color can be repeated query parameters.",
                "q matches title only.",
                "category also checks roomType for matching category-like values.",
                "color token matching ignores punctuation and only uses tokens with length >= 3.",
            ],
        )
    )
    story.append(
        endpoint(
            "GET",
            "/api/furniture-items/{id}",
            "Return a furniture item by UUID.",
            response="FurnitureItem",
            status="200 OK or 404 Not Found.",
        )
    )
    story.append(
        endpoint(
            "POST",
            "/api/furniture-items",
            "Create a furniture item. Intended for admin/internal use.",
            request="""
{
  "title": "Article Sven Sofa",
  "category": "Sofa",
  "brand": "Article",
  "style": "MODERN",
  "color": "Warm beige",
  "price": 1299,
  "roomType": "Living Room",
  "productUrl": "https://...",
  "imageUrl": "https://..."
}
""",
            response="FurnitureItem with generated id",
            status="200 OK",
            notes=["Backend attempts to create an embedding after save when embedding config is available."],
        )
    )

    story.append(h1("7. Swipe / Recommendation APIs"))
    story.append(
        endpoint(
            "GET",
            "/swipe/feed/{userId}?size=20",
            "Return recommendation feed for a user.",
            response="[ FurnitureItem, ... ]",
            status="200 OK",
            notes=[
                "size <= 0 returns an empty list.",
                "size is capped at 100.",
                "If embeddings are unavailable or insufficient, backend fills with unswiped random furniture.",
            ],
        )
    )
    story.append(
        endpoint(
            "POST",
            "/swipe",
            "Record a swipe event for a user/furniture pair.",
            request="""
{
  "userId": "9fdc9d49-7b93-4ac7-b4e5-a9ad6f45d101",
  "furnitureId": "38ef9df6-94cc-4bc4-97a3-52edb1c9d2ee",
  "direction": "RIGHT"
}
""",
            response="""
{
  "ok": true,
  "swipeEventId": "uuid",
  "savedToLiked": true,
  "userEmbedding": {
    "storageReady": true,
    "updated": true,
    "userId": "uuid",
    "positiveCount": 4,
    "negativeCount": 2,
    "swipedEmbeddingCount": 6,
    "skippedMissingFurnitureEmbeddings": 0
  }
}
""",
            status="200 OK, 400 for missing fields, 409 if this user already swiped this furniture.",
            notes=[
                "direction must be LEFT or RIGHT.",
                "RIGHT automatically creates/uses the Liked saved list and saves the item once.",
                "The response includes embedding recompute status; frontend can usually ignore it.",
            ],
        )
    )
    story.append(
        endpoint(
            "GET",
            "/swipe/events/{userId}",
            "Return swipe history for a user, newest first.",
            response="""
[
  {
    "id": "uuid",
    "userId": "uuid",
    "furnitureId": "uuid",
    "direction": "RIGHT",
    "createdAt": "2026-05-10T12:34:56Z"
  }
]
""",
            status="200 OK",
        )
    )

    story.append(PageBreak())

    story.append(h1("8. Saved APIs"))
    story.append(
        endpoint(
            "GET",
            "/saved/{userId}",
            "Return saved furniture in the user's Liked list.",
            response="""
[
  {
    "savedItemId": "uuid",
    "savedAt": "2026-05-10T12:34:56Z",
    "furnitureId": "uuid",
    "title": "Article Sven Sofa",
    "category": "Sofa",
    "brand": "Article",
    "style": "MODERN",
    "color": "Warm beige",
    "price": 1299,
    "roomType": "Living Room",
    "productUrl": "https://...",
    "imageUrl": "https://..."
  }
]
""",
            status="200 OK. Empty array when no Liked list exists.",
            notes=["Frontend should map furnitureId to Product.id if using the Product shape."],
        )
    )
    story.append(
        endpoint(
            "DELETE",
            "/saved/{userId}/{furnitureId}",
            "Remove a furniture item from the user's Liked list.",
            response='{"ok": true}',
            status='200 OK, 404 {"ok":false,"message":"Liked list not found"} or "Saved item not found".',
        )
    )
    story.append(
        endpoint(
            "GET",
            "/saved/lists/{userId}",
            "Return all saved lists for a user.",
            response="""
[
  {
    "id": "uuid",
    "userId": "uuid",
    "name": "Liked",
    "createdAt": "2026-05-10T12:34:56Z"
  }
]
""",
            status="200 OK",
        )
    )
    story.append(
        endpoint(
            "POST",
            "/saved/lists",
            "Create a saved list.",
            request="""
{
  "userId": "9fdc9d49-7b93-4ac7-b4e5-a9ad6f45d101",
  "name": "Liked"
}
""",
            response="SavedList",
            status="200 OK",
        )
    )
    story.append(
        endpoint(
            "GET",
            "/saved/items/{listId}",
            "Return raw saved item records for a list, newest first.",
            response="""
[
  {
    "id": "uuid",
    "savedListId": "uuid",
    "furnitureId": "uuid",
    "createdAt": "2026-05-10T12:34:56Z"
  }
]
""",
            status="200 OK",
        )
    )
    story.append(
        endpoint(
            "POST",
            "/saved/items",
            "Add a raw saved item record to a list.",
            request="""
{
  "savedListId": "uuid",
  "furnitureId": "uuid"
}
""",
            response="SavedItem",
            status="200 OK",
            notes=["This direct endpoint does not de-dupe. The swipe RIGHT path does de-dupe against the Liked list."],
        )
    )

    story.append(h1("9. User Helper APIs"))
    story.append(
        endpoint(
            "POST",
            "/users",
            "Create a user without auth session handling. Treat as internal unless the frontend needs it.",
            request="""
{
  "email": "new.user@example.com",
  "displayName": "New User",
  "authProvider": "LOCAL"
}
""",
            response="User",
            status='201 Created, 400 {"error":"Email is required"}, 409 {"error":"Email already exists"}.',
            notes=["Use /auth/signup for normal email signup because it hashes password and returns a session token."],
        )
    )
    story.append(
        endpoint(
            "GET",
            "/users",
            "List all users. Internal/debug use.",
            response="[ User, ... ]",
            status="200 OK",
            notes=["Current User JSON includes passwordHash. Do not use this in normal frontend screens."],
        )
    )
    story.append(
        endpoint(
            "GET",
            "/users/{id}",
            "Fetch a user by UUID. Internal/debug use.",
            response="User",
            status='200 OK or 404 {"error":"User not found"}.',
        )
    )

    story.append(PageBreak())
    story.append(h1("10. Internal / Operations APIs"))
    story.append(
        endpoint(
            "POST",
            "/api/furniture/import/large",
            "Import the large furniture CSV dataset.",
            response="Imported 123 furniture items.",
            status="200 OK",
            notes=["Plain text response.", "Use manually/admin-side; not needed by the mobile app."],
        )
    )
    story.append(
        endpoint(
            "POST",
            "/api/furniture-items/embeddings/backfill?limit=25&batchSize=25",
            "Backfill missing furniture embeddings.",
            response="""
{
  "configured": true,
  "storageReady": true,
  "limit": 25,
  "batchSize": 25,
  "checked": 25,
  "embedded": 20,
  "skipped": 5,
  "failed": 0,
  "batches": 1
}
""",
            status="200 OK",
            notes=["limit is clamped to 1..500.", "batchSize is clamped to 1..50.", "Requires embedding configuration."],
        )
    )
    story.append(
        endpoint(
            "POST",
            "/swipe/user-embedding/{userId}/recompute",
            "Recompute the user's preference embedding from swipe history.",
            response="""
{
  "storageReady": true,
  "updated": true,
  "userId": "uuid",
  "positiveCount": 4,
  "negativeCount": 2,
  "swipedEmbeddingCount": 6,
  "skippedMissingFurnitureEmbeddings": 0
}
""",
            status="200 OK",
            notes=["Usually triggered automatically by POST /swipe."],
        )
    )
    story.append(
        endpoint(
            "GET",
            "/hello",
            "Simple backend health check.",
            response="maroom backend running",
            status="200 OK",
        )
    )

    story.append(h1("11. Suggested Frontend Flow"))
    story.append(
        bullets(
            [
                "Signup/login via /auth/signup or /auth/login, then persist token and userId.",
                "If hasCompletedOnboarding is false, call GET /preferences/options and POST /preferences.",
                "Home feed can call GET /swipe/feed/{userId}?size=20.",
                "On each card action, call POST /swipe. A RIGHT swipe also saves the item to Liked.",
                "Explore filters should call GET /api/furniture-items/search with repeated query params for multi-select filters.",
                "Saved page should call GET /saved/{userId}; unsave via DELETE /saved/{userId}/{furnitureId}.",
            ]
        )
    )

    return story


def main():
    os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=LETTER,
        rightMargin=0.55 * inch,
        leftMargin=0.55 * inch,
        topMargin=0.72 * inch,
        bottomMargin=0.62 * inch,
        title="MAROOM Backend API Guide",
        author="Codex",
    )
    doc.build(build_story(), onFirstPage=header_footer, onLaterPages=header_footer)
    print(OUTPUT)


if __name__ == "__main__":
    main()
