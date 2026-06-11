"use client";

// My Pathway — the member's administrative home. Tabs: overview (monthly
// progress), log activity, validations, personalized plan, reports,
// county resources, profile.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { getUser } from "@/lib/store";
import Overview from "@/components/dashboard/Overview";
import LogActivity from "@/components/dashboard/LogActivity";
import Validations from "@/components/dashboard/Validations";
import Plan from "@/components/dashboard/Plan";
import Reports from "@/components/dashboard/Reports";
import Resources from "@/components/dashboard/Resources";
import Profile from "@/components/dashboard/Profile";
import ComingSoon from "@/components/dashboard/ComingSoon";

const TABS = ["overview", "log", "validations", "plan", "classes", "career", "reports", "resources", "profile"];

export default function DashboardPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [user, setUser] = useState(undefined);
  const [tab, setTab] = useState("overview");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/signin");
      return;
    }
    setUser(u);
  }, [router, refresh]);

  if (!user) return null;

  const bump = () => setRefresh((n) => n + 1);

  return (
    <div className="container container-wide mt-3">
      <h2 className="mb-1">{t("dash.title", { name: user.name.split(" ")[0] })}</h2>
      <p className="text-small text-muted mb-3">
        {user.county} {t("dash.countySuffix")} ·{" "}
        {["calfresh", "medical"]
          .filter((p) => user.programs.includes(p) || user.programs.includes("both"))
          .map((p) => t(`auth.programs.${p}`))
          .join(" + ")}
      </p>

      <div className="tabs no-print" role="tablist">
        {TABS.map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            className={`tab${tab === k ? " active" : ""}`}
            onClick={() => setTab(k)}
          >
            {t(`dash.tabs.${k}`)}
          </button>
        ))}
      </div>

      {tab === "overview" && <Overview user={user} onChanged={bump} goTo={setTab} />}
      {tab === "log" && <LogActivity user={user} onChanged={bump} />}
      {tab === "validations" && <Validations user={user} onChanged={bump} />}
      {tab === "plan" && <Plan user={user} onChanged={bump} />}
      {tab === "classes" && <ComingSoon which="classes" goTo={setTab} />}
      {tab === "career" && <ComingSoon which="career" goTo={setTab} />}
      {tab === "reports" && <Reports user={user} />}
      {tab === "resources" && <Resources user={user} />}
      {tab === "profile" && <Profile user={user} onChanged={bump} />}
    </div>
  );
}
