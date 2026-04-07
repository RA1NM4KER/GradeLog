import { LegalPage } from "@/components/legal/legal-page";
import {
  termsOfServiceIntro,
  termsOfServiceLastUpdated,
  termsOfServiceSections,
  termsOfServiceTitle,
} from "@/lib/legal/terms-of-service";

export default function TermsPage() {
  return (
    <LegalPage
      intro={termsOfServiceIntro}
      lastUpdated={termsOfServiceLastUpdated}
      sections={termsOfServiceSections}
      title={termsOfServiceTitle}
    />
  );
}
