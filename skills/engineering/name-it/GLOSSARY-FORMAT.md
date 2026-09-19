# GLOSSARY.md format

```md
# {Context name}

{One or two sentences on what this context is.}

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

- **Be opinionated.** When several words name the same concept, pick one and
  list the others under `_Avoid_`.
- **Keep definitions tight.** One or two sentences. Define what it is, not
  what it does.
- **Only project terms.** General programming concepts (timeout, error type,
  cache) stay out even when the project uses them heavily.
- **Group under subheadings** when clusters appear. A flat list is fine when
  they do not.
- **Relationships** record identity and containment, not call graphs.
- **Flagged ambiguities** record a collision that was resolved or is still
  live. A live one stays until a term is chosen.
