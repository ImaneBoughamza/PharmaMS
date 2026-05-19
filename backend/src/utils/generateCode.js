export const generateConfirmationCode = () => {
  const prefix = "RES";
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 900000 + 100000);
  return `${prefix}-${year}-${random}`;
};

export const generateReceiptNumber = () => {
  const prefix = "SAL";
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 900000 + 100000);
  return `${prefix}-${year}-${random}`;
};
