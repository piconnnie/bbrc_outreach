const API_BASE_URL = 'http://localhost:5000/api';

export interface Stats {
    papers_found: number;
    authors_profiled: number;
    emails_sent: number;
}

export interface Config {
    discovery: {
        keywords: string[];
        days_back: number;
        max_results: number;
    };
    outreach: {
        max_daily_emails: number;
        retry_attempts: number;
        delay_seconds: number;
    };
}

export const api = {
    getStats: async (): Promise<Stats> => {
        const response = await fetch(`${API_BASE_URL}/stats`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        return response.json();
    },

    getStatus: async () => {
        const response = await fetch(`${API_BASE_URL}/status`);
        if (!response.ok) throw new Error('Failed to fetch status');
        return response.json();
    },

    getConfig: async (): Promise<Config> => {
        const response = await fetch(`${API_BASE_URL}/config`);
        if (!response.ok) throw new Error('Failed to fetch config');
        return response.json();
    },

    updateConfig: async (config: Partial<Config>) => {
        const response = await fetch(`${API_BASE_URL}/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config),
        });
        if (!response.ok) throw new Error('Failed to update config');
        return response.json();
    },

    startAgent: async (agentName: string) => {
        const response = await fetch(`${API_BASE_URL}/agents/${agentName}/start`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error(`Failed to start ${agentName}`);
        return response.json();
    },

    getAuthors: async () => {
        const response = await fetch(`${API_BASE_URL}/authors`);
        if (!response.ok) throw new Error('Failed to fetch authors');
        return response.json();
    },

    syncAuthors: async () => {
        const response = await fetch(`${API_BASE_URL}/authors/sync`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to sync authors');
        return response.json();
    },

    getLogs: async () => {
        const response = await fetch(`${API_BASE_URL}/logs`);
        if (!response.ok) throw new Error('Failed to fetch logs');
        return response.json();
    }
};
