# Architecture

## Overview

ValideM models a business-logic security problem: a client must never become the authoritative source for prices, discounts, payment state or other server-owned values.

## Main layers

1. **Input**
   - JSON requests, HAR files and built-in scenarios represent observed client traffic.

2. **Trusted reference**
   - A synthetic server-side catalog represents values that should be authoritative.

3. **Analysis**
   - The engine compares client-controlled fields with expected server-owned values and trust rules.

4. **Findings**
   - Detected issues are classified and explained with evidence.

5. **Simulation**
   - Vulnerable and protected backend behavior is contrasted to show the effect of server-side validation.

## Trust boundary

The client may request an item and quantity. Price, discount eligibility, fee calculation, payment confirmation and final totals belong to trusted backend logic.

## Security goal

Make invisible trust mistakes visible. The project is a training tool for reasoning about business logic, not a scanner for third-party services.
