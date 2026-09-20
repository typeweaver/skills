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
  The canonical term for each meaning has not been chosen.
```

## Rules

- **Group under subheadings** when clusters appear. A flat list is fine when
  they do not.
- **Relationships** record stable domain relationships such as identity,
  containment, creation, or responsibility, not call graphs or runtime steps.
- **Flagged ambiguities** record a collision that was asked and left open.
  It stays until every meaning has a canonical term.
