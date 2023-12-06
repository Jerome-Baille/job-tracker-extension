export interface JobData {
    name: string;
    company: string;
    location: string;
    type: string;
    link: string;
    applicationDate: string;
    applicationYear: number;
}

export interface JobDataProps {
    data?: JobData;
    setData: (data: JobData) => void;
    isEmpty?: boolean;
}

export interface TableProps {
    data: JobData;
    setData: (data: JobData) => void;
    isEmpty?: boolean;
}

export interface StorageKeys {
    JT_accessToken: string;
    JT_accessTokenExpireDate: string;
    JT_refreshToken: string;
    JT_refreshTokenExpireDate: string;
    userId?: string;
    userIdExpireDate?: string;
}

export interface LoginFormProps {
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    setUsername: (username: string) => void;
    setPassword: (password: string) => void;
    errorMessage: string;
}