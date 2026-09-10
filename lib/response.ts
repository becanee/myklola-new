import { NextResponse } from 'next/server';

const POWERED_BY = process.env.NEXT_PUBLIC_POWERED_BY || 'PT Klola Indonesia';

interface SuccessOptions<T = unknown> {
  code?: number;
  message: string;
  data?: T;
  headers?: HeadersInit;
}

interface FailedOptions {
  code: number;
  message: string;
  headers?: HeadersInit;
}

export function successResponse<T>(opts: SuccessOptions<T>): NextResponse {
  const { code = 200, message, data, headers } = opts;
  return NextResponse.json(
    {
      success: true,
      code,
      powered_by: POWERED_BY,
      message,
      data,
    },
    { status: code, headers },
  );
}

export function failedResponse(opts: FailedOptions): NextResponse {
  const { code, message, headers } = opts;
  return NextResponse.json(
    {
      success: false,
      code,
      powered_by: POWERED_BY,
      message,
    },
    { status: code, headers },
  );
}
