import { prisma } from "@/lib/prisma";
import {
  displayNameFromAuthMetadata,
  formatReviewDisplayName,
  publicReviewName,
  reviewInitials,
} from "@/lib/reviews/display-name";
import { createClient } from "@/lib/supabase/server";

export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export type HeaderUser = {
  name: string;
  initials: string;
};

export async function getHeaderUser(): Promise<HeaderUser | null> {
  const user = await getAuthUser();
  if (!user?.email) return null;

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: { displayName: true },
  });

  const fullName = publicReviewName(
    profile?.displayName || displayNameFromAuthMetadata(user.user_metadata),
    user.email,
  );

  return {
    name: formatReviewDisplayName(fullName),
    initials: reviewInitials(fullName),
  };
}
