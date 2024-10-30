export const DbCollections = {
  ADMIN: 'Admin',
  USER: 'User',
  TEMPLATE: 'Template',
  TEMPLATE_TYPE: 'TemplateType',
  TEMPLATE_PREVIEW: 'TemplatePreview',
  TEMPLATE_PREVIEW_TYPE: 'TemplatePreviewType',
  PROJECT: 'Project',
  ROLE: 'Role',
};

export const userTypes = {
  USER: 'user',
  ADMIN: 'admin',
};
export const allowedUserTypes = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
};

export const cookieRefs = {
  AUTH_TOKEN: 'authToken',
  cookieExpiry: (): Date =>
    new Date(
      Date.now() +
        (Number(process.env.JWT_EXPIRY) || 1) * 24 * 60 * 60 * 1000,
    ),
};
