export interface SiteConfig {
    site_name: string;
    site_description: string;
    site_keywords: string;
    site_logo: string;
    site_favicon: string;
    user_registration_enabled: boolean;
    user_email_verification: boolean;
    comment_approval_required: boolean;
    article_approval_required: boolean;
    maintenance_mode: boolean;
    maintenance_message: string;
    invite_code_required: boolean;
    invite_code_enabled: boolean;
    site_subname: string;
}