import { onAuthStateChanged } from "firebase/auth";
import { getUserProfile, getPermissions } from "./services/auth.api";
import { setUser, setProfile, setRole, setPermissions, logout, setLoading } from "./auth.slice";
import { auth } from "../../Config/Config";

export const listenToAuth = (dispatch) => {
  dispatch(setLoading(true));
  
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        dispatch(setUser({ uid: user.uid, email: user.email }));
        const profile = await getUserProfile(user.uid);
        dispatch(setProfile(profile));
        dispatch(setRole(profile.role));
        if (profile.permissionId) {
          const permData = await getPermissions(profile.permissionId);
          dispatch(setPermissions(permData.permissions || []));
        } else {
          dispatch(setPermissions([]));
        }
      } catch (error) {
        console.error("Auth sync error:", error);
        dispatch(setPermissions([]));
      }
    } else {
      dispatch(logout());
    }
    dispatch(setLoading(false));
  });
};