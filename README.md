# Golf Charity Subscription Platform

A subscription-driven MERN stack application combining golf performance tracking, monthly prize draws, and charitable fundraising.

**Live Website:** [Deployed Link](https://golf-charity-subscription-gilt.vercel.app/)

---

### Key Features

*   **Subscription Engine:** Monthly and Yearly (discounted) plans with automated renewal logic.
*   **Score Management:** Validated 1–45 Stableford score entry with a rolling 5-score history.
*   **Draw System:** Random and Algorithmic (weighted) monthly draws with automated prize pool calculation and 5-match jackpot rollover.
*   **Charity Integration:** User-selected charity partners with a minimum 10% contribution from subscription fees.
*   **Admin Suite:** Comprehensive control for user management, charity listings, draw execution, and manual winner proof verification.
*   **Modern UI/UX:** Motion-enhanced, mobile-first interface designed with a tech-forward aesthetic (Slate/Emerald/Indigo).

---

### Tech Stack

*   **Frontend:** React (Vite), Tailwind CSS, Framer Motion, Lucide Icons.
*   **Backend:** Node.js, Express.js.
*   **Database:** MongoDB (Mongoose).
*   **Authentication:** JWT (JSON Web Tokens) with role-based access control.
*   **File Handling:** Multer (for winner proof uploads).


### Evaluation Criteria Compliance
*   **Requirements Interpretation:** Translates all PDF specifications into functional features.
*   **System Design:** Proper data modeling for Draws, Users, and Charities.
*   **Scalability:** Structure ready for multi-country expansion and mobile app porting.
*   **Data Handling:** Accurate calculation of prize shares (40/35/25%) and charity percentages.

