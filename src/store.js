import { useState, useEffect, useCallback } from 'react';
import { generateNumber } from './utils';

const STORAGE_KEY = 'myrepublic_data';

const defaultData = {
  republic: {
    name: '',
    motto: '',
    foundedDate: null,
    setupComplete: false,
  },
  constitution: {
    preamble: '',
    articles: [],
  },
  legislature: {
    bills: [],
    nextBillNum: 1,
  },
  judiciary: {
    cases: [],
    nextCaseNum: 1,
  },
  executive: {
    orders: [],
    nextOrderNum: 1,
  },
  activity: [],
};

/**
 * Deep merge loaded data with defaults so that nested keys
 * added in newer versions are always present.
 */
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        republic: { ...defaultData.republic, ...parsed.republic },
        constitution: { ...defaultData.constitution, ...parsed.constitution },
        legislature: { ...defaultData.legislature, ...parsed.legislature },
        judiciary: { ...defaultData.judiciary, ...parsed.judiciary },
        executive: { ...defaultData.executive, ...parsed.executive },
        activity: parsed.activity ?? defaultData.activity,
      };
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return { ...defaultData };
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

// ===== Helper: integer to Roman numeral =====
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

// ===== Helper: create an activity entry =====
function makeActivity(type, icon, text) {
  return {
    id: crypto.randomUUID(),
    type,
    icon,
    text,
    timestamp: new Date().toISOString(),
  };
}

export function useRepublic() {
  const [data, setData] = useState(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const update = useCallback((updater) => {
    setData((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      return { ...next };
    });
  }, []);

  // ===== REPUBLIC =====
  const setupRepublic = useCallback((name, motto) => {
    update((d) => ({
      ...d,
      republic: {
        name,
        motto,
        foundedDate: new Date().toISOString(),
        setupComplete: true,
      },
    }));
  }, [update]);

  // ===== ACTIVITY LOG =====
  const addActivity = useCallback((type, icon, text) => {
    update((d) => ({
      ...d,
      activity: [makeActivity(type, icon, text), ...d.activity].slice(0, 50),
    }));
  }, [update]);

  // ===== CONSTITUTION =====
  const setPreamble = useCallback((preamble) => {
    update((d) => ({
      ...d,
      constitution: { ...d.constitution, preamble },
      activity: [makeActivity('constitution', '🏛️', 'Updated the Preamble'), ...d.activity].slice(0, 50),
    }));
  }, [update]);

  const addArticle = useCallback((title, body) => {
    update((d) => {
      const number = d.constitution.articles.length + 1;
      const article = {
        id: crypto.randomUUID(),
        number,
        title,
        body,
        ratifiedDate: new Date().toISOString(),
        isOriginal: true,
        amendmentOf: null,
        status: 'active',
      };
      return {
        ...d,
        constitution: {
          ...d.constitution,
          articles: [...d.constitution.articles, article],
        },
        activity: [makeActivity('constitution', '🏛️', `Ratified Article ${toRoman(number)}: ${title}`), ...d.activity].slice(0, 50),
      };
    });
  }, [update]);

  const amendArticle = useCallback((articleId, newTitle, newBody) => {
    update((d) => {
      const articles = d.constitution.articles.map((a) =>
        a.id === articleId ? { ...a, status: 'amended' } : a
      );
      const number = articles.length + 1;
      articles.push({
        id: crypto.randomUUID(),
        number,
        title: newTitle,
        body: newBody,
        ratifiedDate: new Date().toISOString(),
        isOriginal: false,
        amendmentOf: articleId,
        status: 'active',
      });
      return {
        ...d,
        constitution: { ...d.constitution, articles },
        activity: [makeActivity('constitution', '🏛️', `Amended Article: ${newTitle}`), ...d.activity].slice(0, 50),
      };
    });
  }, [update]);

  // ===== LEGISLATURE =====
  const proposeBill = useCallback((title, description, department) => {
    update((d) => {
      const num = d.legislature.nextBillNum;
      const bill = {
        id: crypto.randomUUID(),
        number: generateNumber('LR', new Date().getFullYear(), num),
        title,
        description,
        department,
        status: 'draft',
        proposedDate: new Date().toISOString(),
        enactedDate: null,
        repealedDate: null,
        repealReason: null,
        debate: null,
      };
      return {
        ...d,
        legislature: {
          ...d.legislature,
          bills: [bill, ...d.legislature.bills],
          nextBillNum: num + 1,
        },
        activity: [makeActivity('legislature', '📜', `Drafted Bill ${bill.number}: ${title}`), ...d.activity].slice(0, 50),
      };
    });
  }, [update]);

  const advanceBill = useCallback((billId) => {
    update((d) => {
      let logEntry = null;
      const bills = d.legislature.bills.map((b) => {
        if (b.id !== billId) return b;
        if (b.status === 'draft') {
          logEntry = makeActivity('legislature', '📜', `Proposed Bill ${b.number}: ${b.title}`);
          return { ...b, status: 'proposed' };
        }
        if (b.status === 'proposed') {
          logEntry = makeActivity('legislature', '🏛️', `Parliament Session opened for ${b.number}: ${b.title}`);
          return {
            ...b,
            status: 'deliberation',
            debate: { pros: [], cons: [], conclusion: '', decidedDate: null, decision: null },
          };
        }
        return b;
      });
      return {
        ...d,
        legislature: { ...d.legislature, bills },
        activity: logEntry ? [logEntry, ...d.activity].slice(0, 50) : d.activity,
      };
    });
  }, [update]);

  const addDebatePoint = useCallback((billId, type, text) => {
    update((d) => {
      const bills = d.legislature.bills.map((b) => {
        if (b.id !== billId || !b.debate) return b;
        const point = { id: crypto.randomUUID(), text, addedDate: new Date().toISOString() };
        const debate = { ...b.debate };
        if (type === 'pro') {
          debate.pros = [...debate.pros, point];
        } else {
          debate.cons = [...debate.cons, point];
        }
        return { ...b, debate };
      });
      return { ...d, legislature: { ...d.legislature, bills } };
    });
  }, [update]);

  const removeDebatePoint = useCallback((billId, type, pointId) => {
    update((d) => {
      const bills = d.legislature.bills.map((b) => {
        if (b.id !== billId || !b.debate) return b;
        const debate = { ...b.debate };
        if (type === 'pro') {
          debate.pros = debate.pros.filter((p) => p.id !== pointId);
        } else {
          debate.cons = debate.cons.filter((p) => p.id !== pointId);
        }
        return { ...b, debate };
      });
      return { ...d, legislature: { ...d.legislature, bills } };
    });
  }, [update]);

  const concludeDebate = useCallback((billId, decision, conclusion) => {
    update((d) => {
      let logEntry = null;
      const now = new Date().toISOString();
      const bills = d.legislature.bills.map((b) => {
        if (b.id !== billId) return b;
        const debate = { ...b.debate, conclusion, decidedDate: now, decision };
        if (decision === 'enact') {
          logEntry = makeActivity('legislature', '✅', `Parliament enacted Law ${b.number}: ${b.title}`);
          return { ...b, status: 'enacted', enactedDate: now, debate };
        } else {
          logEntry = makeActivity('legislature', '❌', `Parliament rejected Bill ${b.number}: ${b.title}`);
          return { ...b, status: 'rejected', debate };
        }
      });
      return {
        ...d,
        legislature: { ...d.legislature, bills },
        activity: logEntry ? [logEntry, ...d.activity].slice(0, 50) : d.activity,
      };
    });
  }, [update]);

  const amendBillText = useCallback((billId, newTitle, newDescription) => {
    update((d) => {
      let logEntry = null;
      const bills = d.legislature.bills.map((b) => {
        if (b.id !== billId) return b;
        logEntry = makeActivity('legislature', '✏️', `Amended Bill ${b.number} during session`);
        return { ...b, title: newTitle, description: newDescription };
      });
      return {
        ...d,
        legislature: { ...d.legislature, bills },
        activity: logEntry ? [logEntry, ...d.activity].slice(0, 50) : d.activity,
      };
    });
  }, [update]);

  const repealBill = useCallback((billId, reason) => {
    update((d) => {
      let logEntry = null;
      const bills = d.legislature.bills.map((b) => {
        if (b.id !== billId) return b;
        logEntry = makeActivity('legislature', '📜', `Repealed Law ${b.number}: ${b.title}`);
        return { ...b, status: 'repealed', repealedDate: new Date().toISOString(), repealReason: reason };
      });
      return {
        ...d,
        legislature: { ...d.legislature, bills },
        activity: logEntry ? [logEntry, ...d.activity].slice(0, 50) : d.activity,
      };
    });
  }, [update]);

  // ===== JUDICIARY =====
  const fileCase = useCallback((title, description, relatedLawId, department) => {
    update((d) => {
      const num = d.judiciary.nextCaseNum;
      const c = {
        id: crypto.randomUUID(),
        number: generateNumber('CR', new Date().getFullYear(), num),
        title,
        description,
        relatedLawId,
        department,
        filedDate: new Date().toISOString(),
        verdict: 'pending',
        verdictDate: null,
        verdictNotes: '',
        sentence: null,
        sentenceCompleted: false,
      };
      return {
        ...d,
        judiciary: {
          ...d.judiciary,
          cases: [c, ...d.judiciary.cases],
          nextCaseNum: num + 1,
        },
        activity: [makeActivity('judiciary', '⚖️', `Filed Case ${c.number}: ${title}`), ...d.activity].slice(0, 50),
      };
    });
  }, [update]);

  const issueVerdict = useCallback((caseId, verdict, notes, sentence) => {
    update((d) => {
      let logEntry = null;
      const cases = d.judiciary.cases.map((c) => {
        if (c.id !== caseId) return c;
        const vLabel = verdict === 'guilty' ? 'Guilty' : verdict === 'not-guilty' ? 'Not Guilty' : 'Pardoned';
        logEntry = makeActivity('judiciary', '⚖️', `Verdict on ${c.number}: ${vLabel}`);
        return {
          ...c,
          verdict,
          verdictDate: new Date().toISOString(),
          verdictNotes: notes,
          sentence: verdict === 'guilty' ? sentence : null,
        };
      });
      return {
        ...d,
        judiciary: { ...d.judiciary, cases },
        activity: logEntry ? [logEntry, ...d.activity].slice(0, 50) : d.activity,
      };
    });
  }, [update]);

  const completeSentence = useCallback((caseId) => {
    update((d) => {
      const cases = d.judiciary.cases.map((c) =>
        c.id === caseId ? { ...c, sentenceCompleted: true } : c
      );
      return { ...d, judiciary: { ...d.judiciary, cases } };
    });
  }, [update]);

  // ===== EXECUTIVE =====
  const issueOrder = useCallback((title, department, priority, deadline) => {
    update((d) => {
      const num = d.executive.nextOrderNum;
      const order = {
        id: crypto.randomUUID(),
        number: generateNumber('EO', new Date().getFullYear(), num),
        title,
        department,
        priority,
        status: 'active',
        issuedDate: new Date().toISOString(),
        deadline: deadline || null,
        completedDate: null,
      };
      return {
        ...d,
        executive: {
          ...d.executive,
          orders: [order, ...d.executive.orders],
          nextOrderNum: num + 1,
        },
        activity: [makeActivity('executive', '🎖️', `Issued Order ${order.number}: ${title}`), ...d.activity].slice(0, 50),
      };
    });
  }, [update]);

  const completeOrder = useCallback((orderId) => {
    update((d) => {
      let logEntry = null;
      const orders = d.executive.orders.map((o) => {
        if (o.id !== orderId) return o;
        logEntry = makeActivity('executive', '🎖️', `Completed Order ${o.number}: ${o.title}`);
        return { ...o, status: 'completed', completedDate: new Date().toISOString() };
      });
      return {
        ...d,
        executive: { ...d.executive, orders },
        activity: logEntry ? [logEntry, ...d.activity].slice(0, 50) : d.activity,
      };
    });
  }, [update]);

  const cancelOrder = useCallback((orderId) => {
    update((d) => {
      const orders = d.executive.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'cancelled' } : o
      );
      return { ...d, executive: { ...d.executive, orders } };
    });
  }, [update]);

  return {
    data,
    // Republic
    setupRepublic,
    // Constitution
    setPreamble,
    addArticle,
    amendArticle,
    // Legislature
    proposeBill,
    advanceBill,
    repealBill,
    addDebatePoint,
    removeDebatePoint,
    concludeDebate,
    amendBillText,
    // Judiciary
    fileCase,
    issueVerdict,
    completeSentence,
    // Executive
    issueOrder,
    completeOrder,
    cancelOrder,
    // Activity
    addActivity,
  };
}
