import { sileo } from "sileo";

const styles = {
  success: { title: "text-green-600",  description: "text-green-500/80" },
  error:   { title: "text-red-600",    description: "text-red-500/80" },
  warning: { title: "text-amber-600",  description: "text-amber-500/80" },
  info:    { title: "text-blue-600",   description: "text-blue-500/80" },
};

export const toast = {
  success(title: string, description?: string) {
    sileo.success({ title, description, styles: styles.success, duration: 4000 });
  },
  error(title: string, description?: string) {
    sileo.error({ title, description, styles: styles.error, duration: 5000 });
  },
  warning(title: string, description?: string) {
    sileo.warning({ title, description, styles: styles.warning, duration: 4000 });
  },
  info(title: string, description?: string) {
    sileo.info({ title, description, styles: styles.info, duration: 4000 });
  },
};
