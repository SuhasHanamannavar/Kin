import { auth, currentUser } from '@clerk/nextjs/server';
import { ensureUserProfile, getInternalUserId } from '@/lib/db';

/**
 * Helper to get the authenticated Clerk user and map to internal user ID.
 * Creates a user profile on first access.
 */
export async function getAuthContext() {
  const { userId: clerkUserId } = auth();
  
  if (!clerkUserId) {
    return { 
      isAuthenticated: false as const, 
      error: 'Authentication required',
      status: 401
    };
  }

  try {
    // Get or create user profile
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress || `${clerkUserId}@kin.local`;
    const name = user?.firstName || user?.username || undefined;
    
    await ensureUserProfile(clerkUserId, email, name);
    
    const internalUserId = await getInternalUserId(clerkUserId);
    
    if (!internalUserId) {
      return {
        isAuthenticated: false as const,
        error: 'User profile not found',
        status: 500
      };
    }

    return {
      isAuthenticated: true as const,
      clerkUserId,
      internalUserId,
      email,
      name
    };
  } catch (err: any) {
    return {
      isAuthenticated: false as const,
      error: err.message || 'Auth error',
      status: 500
    };
  }
}
