import { LegalPage } from "@/components/legal/legal-page";
import {
  privacyPolicyIntro,
  privacyPolicyLastUpdated,
  privacyPolicySections,
  privacyPolicyTitle,
} from "@/lib/legal/privacy-policy";

export default function PrivacyPage() {
  return (
    <LegalPage
      intro={privacyPolicyIntro}
      lastUpdated={privacyPolicyLastUpdated}
      sections={privacyPolicySections}
      title={privacyPolicyTitle}
    />
  );
}
