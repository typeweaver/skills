# GLOSSARY.md format

```md
# {Project or domain name}

{One or two sentences on what this project is.}

## Language

**Order**:
A customer's request to buy goods, accepted by the seller.
_Avoid_: Purchase, transaction

**Invoice**:
A request for payment sent to a customer after delivery.
_Avoid_: Bill, payment request

**Customer**:
A person or organization that places orders.
_Avoid_: Client, buyer, account

## Relationships

- A **Customer** places many **Orders**
- An **Order** produces zero or one **Invoice**

## Flagged ambiguities

- **"Account"** — previously used for Customer, login, and billing account.
  Canonical: **Customer**. Login and billing stay out of this glossary until
  they earn their own terms.
```

## Rules

- **Group under subheadings** when clusters appear. A flat list is fine when
  they do not.
- **Relationships** record identity and containment, not call graphs.
- **Flagged ambiguities** record a collision that was asked and then either
  resolved or left live. A live one stays until a term is chosen.
