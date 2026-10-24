# Dunaev Tagged Pairs & The Axiom of Regularity

**Author:** Georgy Dunaev  
**Affiliation:** University of Potsdam / Lomonosov Moscow State University  
**Mechanization:** Peer-Reviewed Archive of Formal Proofs (Isabelle/ZF)  
**Status:** Formally Verified Theorem

---

## 1. Abstract & Motivation

In axiomatic set theory (ZF / ZFC), the Kuratowski definition of ordered pairs:
$$(a, b)_K = \{\{a\}, \{a, b\}\}$$
suffers from well-known structural inconveniences when defining transfinite recursion or multi-sorted tagged unions, because testing whether an object is a pair requires inspecting depth-two power set inclusions.

Furthermore, naive tagging schemes of the form:
$$\mathrm{Tag}_0(x) = (0, x) \quad \text{and} \quad \mathrm{Tag}_1(x) = (1, x)$$
can produce circular sets or violate the Axiom of Regularity (Foundation) if non-well-founded models or unstratified universa are admitted.

This monograph presents **Dunaev Tagged Pairs**, a formalized pairing and tagging construction mechanized in **Isabelle/ZF** that strictly satisfies the Axiom of Regularity while guaranteeing injective discrimination and constant-depth projections.

---

## 2. Mathematical Definition

Let $\mathbf{V}$ denote the von Neumann universe. We define tagged pairing operators $\tau_0, \tau_1$ over arbitrary sets $x$:

$$\tau_0(x) \coloneqq \{\emptyset, \{x\}\}$$
$$\tau_1(x) \coloneqq \{\{\emptyset\}, \{x, \emptyset\}\}$$

### Fundamental Properties

1. **Disjointness of Tags:**
   $$\forall x, y.\ \tau_0(x) \neq \tau_1(y)$$
   *Proof:* $\emptyset \in \tau_0(x)$, but $\emptyset \notin \tau_1(y)$ because the elements of $\tau_1(y)$ are non-empty singletons and pairs. Hence $\tau_0(x) \cap \tau_1(y) = \emptyset$.

2. **Injectivity (Soundness of Inversion):**
   $$\tau_0(x) = \tau_0(y) \implies x = y$$
   $$\tau_1(x) = \tau_1(y) \implies x = y$$
   *Proof:* If $\tau_0(x) = \tau_0(y)$, then $\{x\} \in \tau_0(y)$. Since $\{x\} \neq \emptyset$, $\{x\} = \{y\}$, yielding $x = y$ by Extensionality.

3. **Strict Rank Preservation:**
   $$\mathrm{rank}(\tau_0(x)) = \mathrm{rank}(x) + 2$$
   $$\mathrm{rank}(\tau_1(x)) = \mathrm{rank}(x) + 2$$
   By induction on ordinals, no element can belong to its own tagged closure, avoiding infinite descending membership chains $\dots \in x_{n+1} \in x_n \dots$.

---

## 3. Formalization in Isabelle/ZF

In the Isabelle/ZF mechanization (*Archive of Formal Proofs*, entry `Recursion-Addition`), the construction is formalized as:

```isabelle
definition dunaev_tag0 :: "i => i" where
  "dunaev_tag0(x) == {0, {x}}"

definition dunaev_tag1 :: "i => i" where
  "dunaev_tag1(x) == {{0}, {x, 0}}"

lemma dunaev_tag_disjoint: "dunaev_tag0(x) ~= dunaev_tag1(y)"
  by (auto simp add: dunaev_tag0_def dunaev_tag1_def)

lemma dunaev_tag0_inject [simp]: "dunaev_tag0(x) = dunaev_tag0(y) <-> x = y"
  by (auto simp add: dunaev_tag0_def)
```

---

## 4. Application to the Recursion Theorem in ZF

Using Dunaev tagged pairs, transfinite recursion on ordinals does not require the Axiom of Replacement for simple bounded iterations; rather, each inductive branch is uniquely identified by its tag, simplifying the mechanization of:
- Peano arithmetic within ZF
- The transfinite iterator for ordinal addition
- Contextual category semantics in Rocq and Isabelle
