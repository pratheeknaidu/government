// ===== ID & Number Generators =====

export function generateNumber(prefix, year, count) {
    return `${prefix}-${year}-${String(count).padStart(3, '0')}`;
}

// ===== Roman Numerals =====

export function toRoman(num) {
    const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
    let result = '';
    for (let i = 0; i < vals.length; i++) {
        while (num >= vals[i]) {
            result += syms[i];
            num -= vals[i];
        }
    }
    return result;
}

// ===== Date Formatting =====

export function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function formatRelativeTime(iso) {
    if (!iso) return '';
    const now = new Date();
    const d = new Date(iso);
    const diff = now - d;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(iso);
}

// ===== Health Score Calculator =====

export function calculateHealthScore(data) {
    const { constitution, legislature, judiciary, executive } = data;

    // Law adherence (35%)
    const resolvedCases = judiciary.cases.filter((c) => c.verdict !== 'pending');
    const goodCases = resolvedCases.filter(
        (c) => c.verdict === 'not-guilty' || c.verdict === 'pardoned'
    );
    const lawAdherence = resolvedCases.length > 0
        ? (goodCases.length / resolvedCases.length) * 100
        : 100; // no cases = perfect record

    // Order completion (30%) — last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
    const recentOrders = executive.orders.filter((o) => o.issuedDate >= thirtyDaysAgo);
    const completedOrders = recentOrders.filter((o) => o.status === 'completed');
    const failedOrders = recentOrders.filter((o) => o.status === 'expired');
    const decidedOrders = completedOrders.length + failedOrders.length;
    const orderCompletion = decidedOrders > 0
        ? (completedOrders.length / decidedOrders) * 100
        : recentOrders.length > 0 ? 50 : 100; // active orders = neutral

    // Constitution coverage (15%)
    const activeArticles = constitution.articles.filter((a) => a.status === 'active');
    const constitutionCoverage = Math.min(activeArticles.length / 5, 1) * 100;

    // Legislative activity (10%)
    const activeLaws = legislature.bills.filter((b) => b.status === 'enacted');
    const legislativeActivity = Math.min(activeLaws.length / 3, 1) * 100;

    // Judicial diligence (10%)
    const totalCases = judiciary.cases.length;
    const judicialDiligence = totalCases > 0
        ? (resolvedCases.length / totalCases) * 100
        : 100;

    const score = Math.round(
        lawAdherence * 0.35 +
        orderCompletion * 0.30 +
        constitutionCoverage * 0.15 +
        legislativeActivity * 0.10 +
        judicialDiligence * 0.10
    );

    return Math.max(0, Math.min(100, score));
}

export function getScoreTier(score) {
    if (score >= 90) return { name: 'Exemplary Republic', icon: '🏆', class: 'tier-exemplary' };
    if (score >= 70) return { name: 'Stable Democracy', icon: '✅', class: 'tier-stable' };
    if (score >= 50) return { name: 'Under Pressure', icon: '⚠️', class: 'tier-pressure' };
    return { name: 'State of Emergency', icon: '🚨', class: 'tier-emergency' };
}

// ===== Department Helpers =====

export const DEPARTMENTS = [
    { id: 'health', label: 'Health & Fitness', icon: '🏋️', badgeClass: 'badge-health' },
    { id: 'finance', label: 'Finance', icon: '💰', badgeClass: 'badge-finance' },
    { id: 'learning', label: 'Learning & Growth', icon: '📚', badgeClass: 'badge-learning' },
    { id: 'career', label: 'Career', icon: '💼', badgeClass: 'badge-career' },
    { id: 'relationships', label: 'Relationships', icon: '❤️', badgeClass: 'badge-relationships' },
    { id: 'wellbeing', label: 'Wellbeing', icon: '🧘', badgeClass: 'badge-wellbeing' },
];

export function getDepartment(id) {
    return DEPARTMENTS.find((d) => d.id === id) || DEPARTMENTS[0];
}

// ===== Streak Calculator =====

export function calculateStreak(orders) {
    // Count consecutive days (backwards from today) where all issued orders were completed
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;

    for (let i = 0; i < 365; i++) {
        const dayStart = new Date(today);
        dayStart.setDate(dayStart.getDate() - i);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const dayOrders = orders.filter((o) => {
            const issued = new Date(o.issuedDate);
            return issued >= dayStart && issued < dayEnd;
        });

        if (dayOrders.length === 0) {
            if (i === 0) continue; // today might not have orders yet
            break;
        }

        const allCompleted = dayOrders.every((o) => o.status === 'completed');
        if (allCompleted) {
            streak++;
        } else {
            if (i > 0) break; // today is forgiving
        }
    }

    return streak;
}

// ===== Status Helpers =====

export function getBillStatusLabel(status) {
    const map = { draft: 'Draft', proposed: 'Proposed', deliberation: 'In Session', enacted: 'Enacted', repealed: 'Repealed', rejected: 'Rejected' };
    return map[status] || status;
}

export function getNextBillAction(status) {
    if (status === 'draft') return { label: 'Propose', icon: '📤' };
    if (status === 'proposed') return { label: 'Open Session', icon: '🏛️' };
    return null;
}

export function getVerdictLabel(verdict) {
    const map = { pending: 'Pending', guilty: 'Guilty', 'not-guilty': 'Not Guilty', pardoned: 'Pardoned' };
    return map[verdict] || verdict;
}

export function getPriorityLabel(priority) {
    const map = { critical: 'Critical', high: 'High', standard: 'Standard' };
    return map[priority] || priority;
}
