# Security Specification for Frequência de Estágio Escolar

## 1. Data Invariants

1. **Student Invariant**: A student document must have an alphanumeric ID (`isValidId(studentId)`), non-empty full name (`nomeCompleto.size() > 0`), valid gender choice, authorized course category, 4-digit academic year (`anoEstudo.size() == 4`), and valid internship modality (`interno` or `externo`).
2. **Meeting Invariant**: A monthly meeting record cannot exist without a valid `studentId` that references an actual student document (`exists(/databases/$(database)/documents/students/$(incoming().studentId))`).
3. **Meeting State Invariant**: A meeting document must feature a formatted `mesAno` (`YYYY-MM`), an integer year, an integer month (1 to 12), and one of the valid statuses (`Presente`, `Falta`, `Estágio Cancelado`, `Estágio Concluído`, `Pendente`).
4. **Settings Invariant**: Institutional settings must have valid school name, coordination sector, and coordinator name/role.
5. **Authorization Invariant**: Write operations require an authenticated user with verified email (`request.auth != null && request.auth.token.email_verified == true`). The administrative coordinator (`gamesoundsbr@gmail.com`) holds full administrative control.

---

## 2. The "Dirty Dozen" Threat Payloads (Must Return PERMISSION_DENIED)

1. **Unauthenticated Write**: An anonymous or unauthenticated client attempts to create or modify a student in `/students/malicious_1`.
2. **Unverified Email Attack**: A user authenticated with an unverified email address attempts to write to `/students/student_unverified`.
3. **Missing Required Student Keys**: A write payload missing `nomeCompleto` or `matricula`.
4. **Student ID Injection / Path Mismatch**: Payload containing mismatched `id` different from `{studentId}` in the doc path.
5. **Junk / Buffer Overflow String Attack**: A payload containing a 100KB string in `nomeCompleto` or `localEstagio` exceeding `maxLength`.
6. **Invalid Course Enum Injection**: Payload attempting to set `curso: "Hacking"` outside the allowed enum `['Informática', 'Jogos', 'Redes']`.
7. **Invalid Modality Enum Injection**: Payload attempting to set `modalidade: "freelancer"` instead of `interno` or `externo`.
8. **Orphaned Meeting Insertion**: A meeting record submitted with a `studentId` that does NOT exist in the `/students/` collection.
9. **Invalid Meeting Month Injection**: A meeting payload with `mes: 15` or `mesAno: "invalid-date"`.
10. **Invalid Meeting Status Tampering**: Payload with `status: "SuperAdminApproved"` instead of the predefined status list.
11. **Malicious Settings Wipe**: An unauthenticated user attempting to erase the school settings in `/settings/general`.
12. **Arbitrary Collection Write**: An attacker attempting to create documents in arbitrary collections like `/hackers/trojan` (blocked by default-deny catch-all).
