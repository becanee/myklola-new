import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { signJwt } from "@/lib/jwt";
import { securedEncrypt } from "@/lib/encrypter-server";
import { failedResponse } from "@/lib/response";
import {
  fetchTokenFromExternalAPI,
  findOrCreateMember,
} from "@/services/auth/sso";

export async function GET(request: NextRequest) {
  const scope = request.nextUrl.searchParams.get("scope") ?? "";
  const wstoken = request.nextUrl.searchParams.get("wstoken") ?? "";

  if (!scope || !wstoken) {
    return failedResponse({
      code: 400,
      message: "Missing required query params: scope, wstoken",
    });
  }

  try {
    const apiResult = await fetchTokenFromExternalAPI(scope, wstoken);

    if (apiResult.status !== "success" || !apiResult.data) {
      return failedResponse({
        code: 502,
        message: `External SSO auth failed: ${apiResult.status}`,
      });
    }

    const data = apiResult.data;

    // Find or create member in client_members table
    const member = await findOrCreateMember(data);

    if (!member) {
      return failedResponse({
        code: 500,
        message: "Failed to create or find member record",
      });
    }

    // All fields from client_members for JWT + _U cookie
    const companyId = data.klola_id?.[0] ?? null;
    const user = {
      id: Number(data.id),
      name: data.employee?.nama ?? data.name ?? "",
      email: data.email ?? "",
      whatsapp: "",
      role: "CLIENT",
      company_id: companyId,
      company_name: companyId,
      username: data.username ?? "",
      non_employee: data.nonEmployee ?? false,
      has_subordinates: data.hasSubordinates ?? false,
      has_onboarding: data.hasOnboarding ?? false,
      has_contract_review: data.hasContractReview ?? false,
      has_raters: data.hasRaters ?? false,
      has_supervisor: data.hasSupervisor ?? false,
      sid: data.id,
      area: data.area ?? [],
      jenis_pegawai: data.employee?.jenis_pegawai ?? "",
      employee_group: data.employee?.group ?? "",
      cabang: data.employee?.cabang ?? "",
      jabatan: data.employee?.jabatan ?? "",
      pangkat: data.employee?.pangkat ?? "",
      golongan: data.employee?.golongan ?? "",
      employee_area: data.employee?.area ?? "",
      branch: data.employee?.branch ?? "",
      id_branch: data.employee?.id?.branch ?? 0,
      id_department: data.employee?.id?.department ?? 0,
      id_position: data.employee?.id?.position ?? 0,
      id_rank: data.employee?.id?.rank ?? 0,
      id_grade: data.employee?.id?.grade ?? 0,
      id_divisi: data.employee?.id?.divisi ?? 0,
      id_unit: data.employee?.id?.unit ?? null,
      roles: data.roles ?? [],
      setting: data.setting ?? {},
      avatar_url: data.avatar?.url ?? null,
      avatar_potrait: data.avatar?.potrait ?? null,
      avatar_square: data.avatar?.square ?? null,
      is_topuser: data.is_topuser ?? false,
      is_payroll: data.is_payroll ?? false,
      is_pseditor: data.is_pseditor ?? false,
      is_hris: data.is_hris ?? false,
      is_hreditor: data.is_hreditor ?? false,
      is_pm: data.is_pm ?? false,
      is_pmapprover: data.is_pmapprover ?? false,
      is_pmverificator: data.is_pmverificator ?? false,
      is_essapprover: data.is_essapprover ?? false,
      is_essverificator: data.is_essverificator ?? false,
      is_hrapprover: data.is_hrapprover ?? false,
      is_worker: data.is_worker ?? false,
      is_ga: data.is_ga ?? false,
      is_contractreviewer: data.is_contractreviewer ?? false,
      is_contractapprover: data.is_contractapprover ?? false,
      use_travel_cash: data.use_travel_cash ?? false,
      is_ess_admin: data.isESSAdmin ?? false,
      is_hr_admin: data.isHRAdmin ?? false,
      is_payroll_admin: data.isPayrollAdmin ?? false,
      is_pm_admin: data.isPMAdmin ?? false,
      is_finance_admin: data.isFinanceAdmin ?? false,
      is_ga_admin: data.isGAAdmin ?? false,
      is_sys_admin: data.isSysAdmin ?? false,
      last_login: data.last_login ?? null,
      created_at: new Date().toISOString(),
    };

    // const token = await signJwt(user);
    const token = await signJwt({ wstoken: wstoken });
    // const token = wstoken;
    const maxAge = 86400; // 24h

    // Redirect to /client with cookies — use APP_URL env if available (for VPS behind reverse proxy)
    const baseUrl = process.env.APP_URL ?? request.nextUrl.origin;
    const redirectUrl = new URL("/", baseUrl);
    const response = NextResponse.redirect(redirectUrl);

    response.headers.append(
      "Set-Cookie",
      `_T=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`,
    );
    response.headers.append(
      "Set-Cookie",
      `_C=${encodeURIComponent(companyId ?? "")}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`,
    );

    const encryptedUser = securedEncrypt(user);
    response.headers.append(
      "Set-Cookie",
      `_U=${encodeURIComponent(encryptedUser)}; Path=/; SameSite=Lax; Max-Age=${maxAge}`,
    );

    return response;
  } catch (err) {
    console.error("SSO error:", err);
    const message =
      err instanceof Error ? err.message : "SSO authentication failed";
    return failedResponse({ code: 500, message });
  }
}
