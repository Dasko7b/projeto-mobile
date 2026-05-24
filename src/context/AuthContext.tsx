import {
    createContext,
    useContext,
    useState
} from "react";

type AuthContextType = {
    user: User | null
    setUser: React.Dispatch<React.SetStateAction<User | null>>
}

type User = {
    name: string
    email: string
    avatarUrl: string
}


const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: () => null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {

    const [user, setUser] = useState<User | null>(null);

    return (

        <AuthContext.Provider
            value={{
                user,
                setUser
            }}
        >
            {children}
        </AuthContext.Provider>

    );
}

export function useAuth() {
    return useContext(AuthContext);
}
