import { onAuthStateChanged } from "firebase/auth";
import { onSnapshot, doc } from "firebase/firestore";
import { serialize } from "../../shared/utils/serialize";
import { setUser, setProfile, setRole, setPermissions, logout, setLoading } from "./auth.slice";
import { auth, db } from "../../shared/services/firebase";

let profileUnsub = null;
let permUnsub = null;
let currentPermissionId = null;

export const listenToAuth = (dispatch) => {
  dispatch(setLoading(true));
  
  onAuthStateChanged(auth, (user) => {
    if (profileUnsub) profileUnsub();
    if (permUnsub) permUnsub();
    profileUnsub = null;
    permUnsub = null;
    currentPermissionId = null;

    if (user) {
      dispatch(setUser({ uid: user.uid, email: user.email }));

      profileUnsub = onSnapshot(doc(db, "admin-users", user.uid), (docSnap) => {
        if (docSnap.exists()) {
          const profile = serialize({ id: docSnap.id, ...docSnap.data() });
          dispatch(setProfile(profile));
          dispatch(setRole(profile.role));

          const newPermissionId = profile.permissionId;
          
          if (newPermissionId && newPermissionId !== currentPermissionId) {
            if (permUnsub) permUnsub(); 
            currentPermissionId = newPermissionId;

            permUnsub = onSnapshot(doc(db, "permissions", newPermissionId), (permSnap) => {
              if (permSnap.exists()) {
                const permData = serialize({ id: permSnap.id, ...permSnap.data() });
                dispatch(setPermissions(permData.permissions || []));
              } else {
                dispatch(setPermissions([]));
              }
            });
          } else if (!newPermissionId) {
            if (permUnsub) permUnsub();
            permUnsub = null;
            currentPermissionId = null;
            dispatch(setPermissions([]));
          }
        }
        dispatch(setLoading(false));
      }, (error) => {
        console.error("Profile sync error:", error);
        dispatch(setLoading(false));
      });
    } else {
      dispatch(logout());
      dispatch(setLoading(false));
    }
  });
};