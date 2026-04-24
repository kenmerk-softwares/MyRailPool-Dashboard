import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../logo.svg';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useToast } from '../Toast/ToastContext';
import { auth } from '../Config/Config';

export default function Login() {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log(formData)
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            // const user = userCredential.user;
            // const adminRef = doc(db, 'admin-users', user.uid);
            // const adminSnap = await getDoc(adminRef);

            // if (!adminSnap.exists()) {
            //     await signOut(auth);
            //     showToast('Access denied. Admin only.', 'error');
            //     return;
            // }
            // const adminData = adminSnap.data();
            // if (adminData.uid !== user.uid) {
            //     await signOut(auth);
            //     showToast('Account disabled. Contact admin.', 'error');
            //     return;
            // }
            showToast('Login successful', 'success');
            navigate('/');
        } catch (error) {
            console.error(error);

            if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                showToast('User not found or invalid credentials', 'error');
            } else if (error.code === 'auth/wrong-password') {
                showToast('Incorrect password', 'error');
            } else {
                showToast(error.message, 'error');
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-green-50 p-5">
            <div className="bg-white py-8 px-6 md:p-12 rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] w-full max-w-[420px]">
                <div className="text-center mb-8">
                    <div className="flex flex-col justify-center items-center gap-2 mb-1">
                        <img src={logo} alt="Logo" className="w-14 h-14 rounded-full object-cover" />
                        <h1 className="text-[24px] md:text-[28px] font-bold text-[#1e293b] mb-2 m-0">Welcome Back</h1>
                    </div>
                    <p className="text-sm text-[#64748b]">Sign in to your account to continue</p>
                </div>

                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-[#1e293b]">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="px-4 py-3 border-2 border-[#e2e8f0] rounded-[10px] text-[15px] transition-all duration-200 outline-none focus:border-[#6366f1] focus:ring-4 focus:ring-[#6366f1]/10 placeholder:text-[#94a3b8]"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-[#1e293b]">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="px-4 py-3 border-2 border-[#e2e8f0] rounded-[10px] text-[15px] transition-all duration-200 outline-none focus:border-[#6366f1] focus:ring-4 focus:ring-[#6366f1]/10 placeholder:text-[#94a3b8]"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* <div className="text-right -mt-3">
                        <a href="#" className="text-[13px] text-[#6366f1] no-underline font-medium hover:underline">
                            Forgot your password?
                        </a>
                    </div> */}

                    <button
                        type="submit"
                        className="w-full py-3.5 bg-green-900 text-white border-none rounded-[10px] text-base font-semibold cursor-pointer transition-all duration-300 mt-2 hover:-translate-y-0.5 hover:shadow-[0_10px_254,0.4)] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* <div className="text-center text-sm text-[#64748b]">
                    Don't have an account?
                    <a href="#" className="text-[#6366f1] no-underline font-semibold ml-1 hover:underline">
                        Sign up now
                    </a>
                </div> */}
            </div>
        </div>
    );
}
