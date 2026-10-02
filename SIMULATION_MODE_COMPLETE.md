# Simulation mode

Virtual tAED wallets live in `sim_wallets` and `sim_ledger_entries`. Admin treasury is `/admin/simulation`. Credits require an actor, amount, and reason, and they never invent a Stellar hash.

Investing moves available balance to reserved. Activation moves that facility's reserved amount to deployed. An SME payment debits the SME wallet and credits investors' available balance with principal plus lease income, which can be invested again from My investments.

The simulation clock advances application dates only. Installment status uses that date. Settlement label is Simulation Ledger.

Known limits: scenario presets are the same admin actions rather than one-click scripts, and there is no real Testnet transfer behind the ledger.
