import { getUtxos } from "@/utils/libs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { address } = await req.json();

  try {
    const response = await getUtxos(address);
    return NextResponse.json({ status: 200, data: response, message: null });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      data: null,
      message: error,
    });
  }
}
