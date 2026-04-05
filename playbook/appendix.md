[← Previous: Case Studies](./ch7-case-studies.md) · **Appendix** · [Back to Table of Contents](./README.md)

---

# Appendix — Glossary and References

## Glossary of Technical Terms

### A

**Asset Discovery**
Systematic process for identifying and documenting all digital assets
of a client. Includes recording wallet addresses, exchange accounts,
DeFi positions, and other digital assets.

### B

**BGH Ruling III ZR 183/17**
German Federal Court of Justice ruling (July 12, 2018) clarifying
that inheritance disclosure obligations exist even for digital assets
that do not constitute classic tangible property. Establishes that
digital infrastructure providers have disclosure duties toward heirs —
regardless of asset custody.

### C

**CASP (Crypto-Asset Service Provider)**
Term from the EU MiCA regulation for providers of services in crypto-
assets: custody, operation of a trading platform, exchange, placement,
and advice on crypto-assets.

**Compliance Architecture**
The systematic structure of processes, controls, and documentation
ensuring a system meets regulatory requirements.

### D

**DeFi (Decentralized Finance)**
Collective term for decentralized financial applications based on
blockchain technology, enabling traditional financial services without
central intermediaries.

**Digital Asset Inventory**
Complete record of all digital assets including technical details:
wallet addresses, balances, transaction history, access information.

### F

**Four-Eyes Principle**
Control principle where critical decisions or transactions must be
reviewed or approved by at least two independent persons.

### G

**Governance**
The structure and processes by which organizations or systems are
directed and controlled. In this framework: the regulations governing
the transfer of digital assets.

### H

**Heritage Integrity Framework**
Comprehensive quality-assurance system ensuring integrity,
authenticity, and completeness of all estate-relevant processes and
data. Based on three pillars: document integrity, process integrity,
data integrity.

### I

**Inheritance Container**
Central innovation of the framework: an encrypted, self-contained data
space inherently containing all estate-relevant information. Travels
with the asset and exists independently of any infrastructure.
Fundamentally differs from external document storage through inherent
asset linkage.

**Inheritance Quota**
The share of the estate to which an heir is entitled according to
statutory succession or testamentary disposition.

### L

**Legacy Proof Protocol**
Transforms the traditional succession process through **reversal of
the burden of proof**. Establishes and documents eligibility during
the asset owner's lifetime so heirs no longer need to provide proof
upon death. Enables time savings of 50–75% and cost reduction of
60–80%.

### M

**MiCA (Markets in Crypto-Assets)**
EU regulation (EU 2023/1114), fully applicable since 2024, creating
a harmonized legal framework for crypto-assets and related services
in the European Union. Regulates CASP license requirements,
transparency obligations, and consumer protection.

### N

**No-Custody**
Core principle of the Sovereign Guard Architecture: the system assumes
no custody of assets, no custody of private keys, no control over
assets. Significantly reduces regulatory risks and liability.

### P

**Private Key**
Cryptographic key enabling ownership and control over digital assets.
Whoever controls the private key controls the associated assets.

### R

**Regulatory Change Management**
Systematic process for monitoring, assessing, and implementing
regulatory changes. Ensures the framework remains compliant as legal
requirements change.

### S

**Seed Phrase**
Usually 12 or 24 English words from which a wallet's private key can
be reconstructed. Acts as master backup for wallet access.

**Segregation of Duties**
Control principle ensuring no single person possesses all permissions
required for a critical process.

**Shamir's Secret Sharing (SSS)**
Cryptographic threshold scheme splitting a secret into n shares,
where any k shares can reconstruct the secret (k ≤ n), but fewer
than k reveal nothing. Foundation of the Inheritance Container's
secure key distribution.

**Smart Contract**
Self-executing contract on a blockchain that executes automatically
when predefined conditions are met.

**Sovereign Guard Architecture**
The foundation of the framework: paradigmatic approach with the
principle of **orchestration without custody, governance without
liability**. Eliminates regulatory risks through no-custody
positioning.

**Succession Sentinel System**
Automation component of the Sovereign Guard Architecture. Continuous
monitoring of the asset owner's status with automatic activation on
death, incapacity, or other defined trigger events.

### T

**Tamper-Evident Logging**
Logging system where any manipulation is detectable. Cryptographic
mechanisms ensure changes to records become immediately visible.

**Transfer Gate Protocol**
Control component of the Sovereign Guard Architecture. Standardized
approval processes for asset transfers with multi-stage validation,
documented control points, and audit-ready logging.

### W

**White-Label**
Ability of a solution to be operated under the buyer's brand without
the original provider's brand being visible. Enables differentiation
under one's own brand.

---

## Quick Reference: New Terms by Application Area

| Application Area | Term | Brief Definition |
|---|---|---|
| Architecture | Sovereign Guard Architecture | Orchestration without custody |
| Core data | Inheritance Container | Self-contained data space |
| Validation | Legacy Proof Protocol | Reversal of burden of proof |
| Monitoring | Succession Sentinel | Automatic status detection |
| Control | Transfer Gate Protocol | Approval processes |
| Quality | Heritage Integrity Framework | Compliance quality assurance |

---

## References and Sources

### Legal and Regulatory

- **BGH III ZR 183/17** (Bundesgerichtshof, Urteil vom 12. Juli 2018)
  — "Facebook-Erbe" ruling establishing heirs' information rights
  over digital assets.
  https://juris.bundesgerichtshof.de/cgi-bin/rechtsprechung/document.py?Gericht=bgh&Art=en&sid=19a2797e43c7f3bf94fd079e4fcba5d2&nr=86602

- **MiCA — Verordnung (EU) 2023/1114** — Regulation on Markets in
  Crypto-Assets. Official EUR-Lex text:
  https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023R1114

- **GDPR — Verordnung (EU) 2016/679** — General Data Protection
  Regulation. Official EUR-Lex text:
  https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679

- **FATF (2021)** — *Updated Guidance for a Risk-Based Approach to
  Virtual Assets and Virtual Asset Service Providers*.
  https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Guidance-rba-virtual-assets-2021.html

- **OECD (2022)** — *Crypto-Asset Reporting Framework (CARF) and
  Amendments to the Common Reporting Standard*.
  https://www.oecd.org/tax/exchange-of-tax-information/crypto-asset-reporting-framework-and-amendments-to-the-common-reporting-standard.htm

- **BaFin** — current supervisory practice guidance:
  https://www.bafin.de/

### Lost-Asset and Market-Size Estimates

- **Chainalysis (2020)** — *Bitcoin's $30 Billion Sell-Off*. Analysis
  of dormant Bitcoin supply.
  https://www.chainalysis.com/blog/bitcoin-market-data-exchanges-trading/

- **Glassnode** — on-chain analytics on dormant supply and long-term
  holders.
  https://glassnode.com/

- **Cerulli Associates / Boston Consulting Group** — global digital
  wealth transfer projections through 2045.

### Cryptographic Foundations

- **Shamir, A. (1979)** — *How to Share a Secret*. Communications of
  the ACM, 22(11): 612–613. The original threshold secret-sharing
  scheme used by the Inheritance Container.

- **Feldman, P. (1987)** — *A Practical Scheme for Non-Interactive
  Verifiable Secret Sharing*. FOCS 1987. The Verifiable Secret Sharing
  (VSS) extension allowing share-integrity validation.

### German Inheritance Law Foundations

- **BGB §§ 1922 ff.** — Inheritance-law provisions of the German Civil
  Code.

- **BGH-Rechtsprechung** to digital-asset inheritance, ongoing.

---

## About This Framework

**DAIO — Digital Asset Inheritance Orchestration**
Version 2.0 · April 2026

**Author:** Deniz Kiran / Back2IQ
**License:** [CC BY-NC-SA 4.0](../LICENSE)
**Contact:** dk@back2iq.com.tr
**Web:** https://daio.back2iq.com
**Repository:** https://github.com/Back2IQ/daio

### Citation

```
Kiran, D. (2026). DAIO — Digital Asset Inheritance Orchestration.
The Institutional Implementation Blueprint for Digital Asset Succession.
Back2IQ. https://daio.back2iq.com
```

### Commercial Licensing

This framework is free for non-commercial use with attribution under
CC BY-NC-SA 4.0. The following require separate commercial licenses:

- **White-label deployment** under your firm's brand
- **White-label Template Generator** exports (logo, branded PDFs)
- **Implementation support** — 90-day guided onboarding
- **Regulatory update service** — ongoing MiCA/BGH/BaFin change notifications

Contact: **dk@back2iq.com.tr**

---

[← Previous: Case Studies](./ch7-case-studies.md) · **Appendix** · [Back to Table of Contents](./README.md)
