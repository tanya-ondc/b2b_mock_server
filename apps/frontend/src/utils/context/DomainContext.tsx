import { createContext, useState } from "react";

type DomainProviderType = {
	children: React.ReactNode;
};
type DomainContextType = {
	domain: string;
	setDomain: React.Dispatch<React.SetStateAction<string>>;
};

export const DomainContext = createContext<DomainContextType>({
	domain: "",
	setDomain: () => {},
});

export const DomainProvider = ({ children }: DomainProviderType) => {
	const [domain, setDomain] = useState("");
	console.log("domainnnn",domain)
	return (
		<DomainContext.Provider value={{ domain, setDomain }}>
			{children}
		</DomainContext.Provider>
	);
};
