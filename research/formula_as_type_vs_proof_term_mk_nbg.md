# Formulas as Types, Proofs as Terms: Compile-Time Soundness of the Obelisk MK/NBG Kernel

**Author:** Georgy Dunaev
**Affiliation:** University of Potsdam / Lomonosov Moscow State University
**Mechanization:** Obelisk MK/NBG kernel (Poly/ML, LCF-style, Curry–Howard)
**Status:** Formally Verified Architecture
**Ticket:** 701 (curated), resolved by `mistral/codestral-latest` (Capability Tier 1); assigned to `groq/openai/gpt-oss-120b`, signed Gemini 4 Argon (high effort)

---

## 1. Abstract

In the Obelisk proof assistant for Morse–Kelley / Bernays–Gödel class theory, a
**formula is a type** and a **proof is an explicit lambda/eliminator term**.
Declaring a formula never proves anything — a false formula is simply an
*empty type*. Soundness is enforced not by review but by the type discipline
of the kernel's sort system: Russell's paradoxical class
`R = { x | x notin x }` is a well-sorted inhabitant of `ClassSort` but can
never be *packed* into `SetSort`. The checking of a `theorem` declaration is
itself the verification of its proof.

---

## 2. Two Distinct Languages

### 2.1 Formulas are Types

```nbg
(* TRUE formula — a non-empty (inhabited) type *)
formula EmptyHasNoElements = forall (z:Class). z in { x | Bot } -> Bot;

(* FALSE formulas — perfectly legal, well-formed, but UNINHABITED types *)
formula False_RussellIsSet    = Set({ x | x in x -> Bot });
formula False_UnivInUniv      = { x | Top } in { x | Top };
formula False_MembershipSym   = forall (A:Class). forall (B:Class). A in B -> B in A;
```

`formula <Name> = <Formula>;` introduces a type in `NBGCompiler.Type`.
Mathematical falsity corresponds to type emptiness (isomorphism with
`Bot`), not to ill-formedness. Importantly, formula *definitions* are not
proofs: a rejected kernel error makes this explicit —

```
theorem bad_1 : Set({ x | x in x -> Bot }) = False_RussellIsSet;
--> TypeError: Cannot use formula definition 'False_RussellIsSet' as a proof term!
```

### 2.2 Proofs are Terms

A proof is an explicit term in `NBGCompiler.Expr` built from a *closed set* of
primitive inference rules and axiom constructors — `compr`, `fn`/`Lam`, `tapp`,
`pack`/`unpack`, `fst`/`snd`, `inl`/`inr`/`case`, `abort`, `refl`/`sym`/`trans`,
`heredity`, `dunaev_proj`:

```nbg
theorem thm_empty_no_elements : forall (z:Class). z in { x | Bot } -> Bot =
  Lam (z:Class) =>
    fn (hIn : z in { x | Bot }) =>
      snd((fst(compr(x. Bot, z)) hIn));

theorem thm_dunaev_proj :
  forall (A:Class). forall (B:Class). pr1([A, B]_D) = A /\ pr2([A, B]_D) = B =
  Lam (A:Class) => Lam (B:Class) => dunaev_proj(A, B);
```

There is no tactic elaboration layer and no operational machine code: to
*compile* a `theorem <Name> : <Formula> = <ProofTerm>;` declaration is
precisely to verify its proof, in the LCF tradition where only the kernel can
inhabit the theorem's type.

---

## 3. Sort Discipline and the Refutation of Russell's Paradox

The two-sorted universe (`SetSort` ⊂ `ClassSort`) is enforced statically:

- **Comprehension** `compr(x. φ(x), A)` unfolds via an eliminator that
  *demands a `SetSort` witness* before returning membership: applying the
  eliminator to a bare class argument is a type error
  (`EApp argument type mismatch`).
- **Set-quantifier instantiation** (`tapp` on `forall x:Set. …`) rejects
  general class terms (`ETApp sort violation: argument X is a general Class
  and not proven to satisfy Set(X)`).
- **SetSort existentials** (`pack`) only accept manifests, i.e. terms already
  verified to solve `Set(z)`; Russell's class is bar-packed:

```
theorem bad_2 : exists (y:Set). y = { x | x in x -> Bot } =
  pack({ x | x in x -> Bot }, refl(...), exists (y:Set). y = ...);
--> TypeError: EPack witness `{ x | (x in x -> Bot) }` for SetSort existential
    is a general Class term, not a verified Set!
```

Thus `R = { x | x notin x }` exists legitimately as a proper class in
`ClassSort`, and the *theorem* `Set(R) -> Bot` has a positive constructive
proof term (`thm_russell_not_set`), while its negation never compiles. The
paradox is not refuted mathematically at runtime — it is **unrepresentable
at type-check time**.

---

## 4. Consequences

1. **False yet legal definitions** let the kernel serve as a *test bench*:
   the guide's Part III deterministically rejects four canonical paradox
   attempts, mechanically distinguishing truth from well-formedness.
2. **Predicativity is a compiler mode**, not a convention: in Stage I (pure
   NBG) comprehension formulas must quantify only over `SetSort`
   (`isPredicativeFormula`); Stage II (`theory MK_Impredicative;`) unlocks
   impredicative Morse–Kelley comprehension over `ClassSort`.
3. **Proof irrelevance by construction**: any two terms occupying the same
   formula-type are interchangeable, since only kernel-checked inhabitants
   exist at all.

---

## 5. Artifacts

- Kernel guide with verified theorems and rejected counter-attempts:
  `set_theory_prover/examples/true_and_false_mk_guide.nbg`
- Propositions-as-types export: `set_theory_prover/export/nbg_propositions_as_types.lp`
- Related research note: [Dunaev Tagged Pairs & the Axiom of Regularity](tagged_pairs_regularity.md)
