import { useAuth } from '@/hooks/useAuth';
import { getLetterPermissions, LetterPermissions } from '@/utils/letterPermissions';
import { LetterItem } from '@/types/letter';

/**
 * Returns the full permission set for the currently authenticated user.
 * Optionally pass a specific letter to get letter-state-aware permissions.
 *
 * @example
 * const perms = useLetterPermissions();
 * const perms = useLetterPermissions(letter); // letter-level permissions
 */
export function useLetterPermissions(letter?: LetterItem | null): LetterPermissions {
  const { user } = useAuth();
  return getLetterPermissions(user?.role, letter);
}

export default useLetterPermissions;
