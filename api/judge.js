export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    const { caseTitle, caseDescription, relatedLaw, constitution } = req.body || {};

    if (!caseTitle) {
        return res.status(400).json({ error: 'caseTitle is required' });
    }

    const systemPrompt = `You are the Chief Justice of a personal republic — a life-governance system where the citizen holds themselves accountable through laws, cases, and verdicts.

You will receive a case filed by the citizen against themselves, along with their constitution and the related law (if any). Your job is to evaluate the case fairly and return a verdict.

Respond with ONLY valid JSON in this exact format:
{"verdict": "guilty" | "not-guilty" | "pardoned", "notes": "brief reasoning for the verdict", "sentence": "corrective action if guilty, empty string otherwise"}

Guidelines:
- "guilty" — the citizen clearly violated their own law or principle
- "not-guilty" — the case doesn't constitute a real violation, or there are mitigating factors
- "pardoned" — technically guilty but circumstances warrant forgiveness (first offense, external factors, etc.)
- Keep notes concise (1-3 sentences)
- Sentences should be specific, actionable corrective actions (e.g., "30 minutes extra workout tomorrow")
- Only include a sentence for guilty verdicts; use empty string for not-guilty/pardoned`;

    let userMessage = `Case: ${caseTitle}`;
    if (caseDescription) {
        userMessage += `\nDetails: ${caseDescription}`;
    }
    if (relatedLaw) {
        userMessage += `\nRelated Law: ${relatedLaw}`;
    }
    if (constitution) {
        userMessage += `\nConstitution: ${constitution}`;
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 512,
                system: systemPrompt,
                messages: [{ role: 'user', content: userMessage }],
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('Anthropic API error:', err);
            return res.status(502).json({ error: 'Failed to reach the Judge' });
        }

        const result = await response.json();
        const text = result.content?.[0]?.text || '';

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch {
            console.error('Failed to parse LLM response:', text);
            return res.status(502).json({ error: 'Judge returned an invalid response' });
        }

        const validVerdicts = ['guilty', 'not-guilty', 'pardoned'];
        if (!validVerdicts.includes(parsed.verdict)) {
            console.error('Invalid verdict from LLM:', parsed.verdict);
            return res.status(502).json({ error: 'Judge returned an invalid verdict' });
        }

        return res.status(200).json({
            verdict: parsed.verdict,
            notes: parsed.notes || '',
            sentence: parsed.sentence || '',
        });
    } catch (err) {
        console.error('Judge endpoint error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
