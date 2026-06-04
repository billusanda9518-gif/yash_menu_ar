-- ARMenu: Resolve RLS recursion loop between restaurants and restaurant_staff

-- Create a SECURITY DEFINER function to check restaurant ownership.
-- This function runs with the privileges of the creator (bypassing RLS),
-- which breaks the circular query lookup.
CREATE OR REPLACE FUNCTION public.is_restaurant_owner(res_id uuid, u_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE id = res_id AND owner_id = u_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop the old policy that directly queried restaurants (triggering RLS)
DROP POLICY IF EXISTS "Owners can manage staff" ON public.restaurant_staff;

-- Create the new non-recursive policy using our helper function
CREATE POLICY "Owners can manage staff"
  ON public.restaurant_staff FOR ALL
  USING (public.is_restaurant_owner(restaurant_id, auth.uid()));
