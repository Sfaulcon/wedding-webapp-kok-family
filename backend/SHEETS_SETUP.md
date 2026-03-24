# Google Sheets Setup

Add these tabs to your wedding spreadsheet. Names must match exactly.

---

## Invites

| invite_token | group_name |
|--------------|------------|
| abc123       | The Smith Family |

---

## Guests

| guest_id | invite_token | full_name | invited_wedding | invited_braai | accomodation_required |
|----------|--------------|-----------|-----------------|---------------|------------------------|
| g001     | abc123       | John Doe  | TRUE            | TRUE          | FALSE                  |

- **accomodation_required**: TRUE = has venue accommodation, FALSE = needs to arrange own

---

## Venue_Payments

Venue accommodation and payment tracking. One row per guest with venue accommodation.

| guest_id | invite_token | full_name | cottage_number | amount_owed | payment_received |
|----------|--------------|-----------|----------------|-------------|------------------|
| g001     | abc123       | John Doe  | 5              | 1500        | FALSE            |

- **cottage_number**: Cottage/room number at venue
- **amount_owed**: Amount in ZAR the guest owes
- **payment_received**: Checkbox – check when the couple has received payment. Guests see "Payment received" or "Payment pending" on the webapp.

---

## Website_Info

Content shown on the website: dress code, gifts message, and banking details.

| Item             | Value                                                          |
|------------------|----------------------------------------------------------------|
| dress_code       | Suit and Tie                                                   |
| gifts            | Your presence at our celebration is the greatest gift...       |
| bank_name        | FNB                                                            |
| account_holder   | John Doe                                                       |
| account_type     | Savings / Current / etc.                                       |
| account_number   | 1234567890                                                     |
| branch_code      | 250655                                                         |

- **Item**: Exact name (dress_code, gifts, bank_name, account_holder, account_type, account_number, branch_code)
- **Value**: The text to display

---

## Food_Options

Menu options grouped by course. Shown in the Food lightbox under Starters, Main course, Desserts.

| Course  | Option             |
|---------|--------------------|
| Starter | Soup of the day    |
| Starter | Seasonal salad     |
| Main    | Chicken            |
| Main    | Beef               |
| Main    | Vegetarian option  |
| Dessert | Chocolate cake     |
| Dessert | Fruit salad        |

- **Course**: Starter, Main, or Dessert (spelling must match)
- **Option**: Name of the dish

---

## Story

Your couple story timeline. Each row is one point on the winding timeline.

| Order | Date | Title           | Description                    |
|-------|------|-----------------|--------------------------------|
| 1     | 2020 | How We Met      | We met at...                   |
| 2     | 2021 | First Adventure | Our first trip together...     |
| 3     | 2023 | The Proposal    | He proposed on...              |
| 4     | 2026 | Our Wedding Day | The beginning of forever.      |

- **Order**: Number for display order (1, 2, 3...)
- **Date**: Year or label (e.g. "2020")
- **Title**: Short title
- **Description**: Full story text (shown in lightbox when clicked)
