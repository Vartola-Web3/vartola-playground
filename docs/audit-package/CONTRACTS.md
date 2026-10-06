# Contract inventory

Source of truth for identifiers: `lib/docs/testnet-record.generated.json`, exported from the real deployment. Do not edit IDs by hand.

| Contract | Version | ID (Stellar Testnet) |
| --- | --- | --- |
| wallet_registry | v3 | CDJ5MMB2JZCWX2HZT7NOHBQRCQTDVEPKJNOQSGDMYVIX7GL5JO7EIDNC |
| facility_contract | v3 | CDS5HIFCHMLR7VHOGHDMJEXMUI3CINY2R6FPRA4UVZIPPAUGQ6P4ERFM |
| VTAED Stellar Asset Contract | n/a | CCSZAIHVNLOJWHMOZ7W4L3J3YR6I5UZXVMEAATIIRZD4OODODOT4KRJS |

VTAED issuer: GATMFYSVHN25CTFMW27USR65VTIIH4DSEA2MCRELBGWQBDEZRJTCOW32. Test asset, no value, not redeemable.

Superseded and never used: v1 (CBJQTADV…, replaced after an authorization review) and v2 (CACYOVPK…, replaced by role separation and explicit escrow).

`finance_math` is a library crate used by `facility_contract`; it is not deployed on its own.

## Roles (separate Testnet wallets)

| Role | Authority |
| --- | --- |
| ADMIN | Authorizes release, rotates roles (two-step), approves upgrades after the timelock, unpauses |
| PAUSER | Pauses. Cannot move funds |
| TREASURY | Receives fees and pays the approved supplier after authorization, within the daily release limit |
| UNDERWRITER | Creates facilities, attests risk and final approval |
| OPERATIONS | Locks release, attests operational conditions, activates, records servicing, sets settlement quote, may pay recovery |
| COMPLIANCE | Attests the compliance release condition and wallet permissions |

## Key behaviours to review

Escrow states (open, partially funded, fully funded, release locked, release authorized, released, refunded, closed). Eight release conditions each attested by its responsible role with an evidence hash. One waterfall for repayment, settlement and recovery. Non-transferable positions. Daily release limit. Two-step admin rotation. Contract version and timelocked upgrade path.

Addresses and every deployment transaction hash: `/technical` and `/admin/contracts`.
