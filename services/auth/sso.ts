import { and, eq } from 'drizzle-orm';
import { db } from '@/drizzle/db';
import { clientMembers } from '@/drizzle/schemas/client_members';

/* ─── external API types ─── */

interface AvatarData {
  url?: string;
  potrait?: string;
  square?: string;
}

interface SettingData {
  language?: string;
  timezone?: string;
  attendanceMultiple?: boolean;
  attendanceRestriction?: boolean;
  attendanceLat?: number;
  attendanceLong?: number;
  attendanceRadius?: number;
  attendanceFaceID?: boolean;
  useCompensatory?: boolean;
  canRequestWarrant?: boolean;
}

interface EmployeeData {
  employee_id?: number;
  nip?: string;
  nama?: string;
  jenis_pegawai?: string;
  group?: string;
  cabang?: string;
  jabatan?: string;
  pangkat?: string;
  golongan?: string;
  area?: string;
  branch?: string;
  id?: {
    branch?: number;
    department?: number;
    position?: number;
    rank?: number;
    grade?: number;
    divisi?: number;
    unit?: number | null;
  };
}

interface AreaItem {
  name?: string;
  lat?: number;
  long?: number;
  radius?: number;
}

export interface SsoApiResponse {
  status: string;
  data?: SsoApiData;
  httpCode?: number;
}

export interface SsoApiData {
  id: number;
  klola_id: string[];
  name: string;
  username: string;
  email: string;
  nonEmployee: boolean;
  hasSubordinates: boolean;
  hasOnboarding: boolean;
  hasContractReview: boolean;
  hasRaters: boolean;
  hasSupervisor: boolean;
  sid: number;
  area: AreaItem[];
  employee: EmployeeData;
  roles: string[];
  setting: SettingData;
  avatar: AvatarData;
  is_topuser: boolean;
  is_payroll: boolean;
  is_pseditor: boolean;
  is_hris: boolean;
  is_hreditor: boolean;
  is_pm: boolean;
  is_pmapprover: boolean;
  is_pmverificator: boolean;
  is_essapprover: boolean;
  is_essverificator: boolean;
  is_hrapprover: boolean;
  is_worker: boolean;
  is_ga: boolean;
  is_contractreviewer: boolean;
  is_contractapprover: boolean;
  use_travel_cash: boolean;
  isESSAdmin: boolean;
  isHRAdmin: boolean;
  isPayrollAdmin: boolean;
  isPMAdmin: boolean;
  isFinanceAdmin: boolean;
  isGAAdmin: boolean;
  isSysAdmin: boolean;
  last_login: string;
}

/* ─── mapper ─── */

function mapApiToDb(data: SsoApiData) {
  const e = data.employee ?? {};
  const ids = e.id ?? {};
  return {
    klola_ids: data.klola_id ?? [],
    name: e.nama ?? data.name ?? '',
    username: e.nip ?? data.username ?? '',
    email: data.email ?? '',
    non_employee: data.nonEmployee ?? false,
    has_subordinates: data.hasSubordinates ?? false,
    has_onboarding: data.hasOnboarding ?? false,
    has_contract_review: data.hasContractReview ?? false,
    has_raters: data.hasRaters ?? false,
    has_supervisor: data.hasSupervisor ?? false,
    sid: data.id,
    area: JSON.stringify(data.area ?? []),
    jenis_pegawai: e.jenis_pegawai ?? '',
    employee_group: e.group ?? '',
    cabang: e.cabang ?? '',
    jabatan: e.jabatan ?? '',
    pangkat: e.pangkat ?? '',
    golongan: e.golongan ?? '',
    employee_area: e.area ?? '',
    branch: e.branch ?? '',
    id_branch: ids.branch ?? 0,
    id_department: ids.department ?? 0,
    id_position: ids.position ?? 0,
    id_rank: ids.rank ?? 0,
    id_grade: ids.grade ?? 0,
    id_divisi: ids.divisi ?? 0,
    id_unit: ids.unit ?? null,
    roles: data.roles ?? [],
    setting: JSON.stringify(data.setting ?? {}),
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
    last_login: data.last_login ? new Date(data.last_login) : null,
  };
}

/* ─── public API ─── */

export async function fetchTokenFromExternalAPI(
  scope: string,
  wstoken: string,
): Promise<SsoApiResponse> {
  const formData = new FormData();
  formData.append('wstoken', wstoken);
  formData.append('scope', scope);

  const res = await fetch('https://api.klola.app/auth/token', {
    method: 'POST',
    headers: { lang: 'en', 'x-scope': scope },
    body: formData,
  });

  return (await res.json()) as SsoApiResponse;
}

export async function findOrCreateMember(data: SsoApiData) {
  const companyId = data.klola_id?.[0];

  const existing = await db
    .select()
    .from(clientMembers)
    .where(
      and(
        eq(clientMembers.sid, data.id),
        companyId
          ? eq(clientMembers.klola_ids, [companyId])
          : undefined,
      ),
    )
    .limit(1);

  if (existing[0]) {
    // Update last_login
    await db
      .update(clientMembers)
      .set({ last_login: new Date() })
      .where(eq(clientMembers.id, existing[0].id));
    return existing[0];
  }

  // Insert new row
  const values = mapApiToDb(data);
  const [inserted] = await db
    .insert(clientMembers)
    .values(values)
    .returning();

  return inserted;
}
