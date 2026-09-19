import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

interface RouterContextType {
  pathname: string;
  search: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
  outletElement: React.ReactNode | null;
  setOutletElement: (el: React.ReactNode | null) => void;
}

const RouterContext = createContext<RouterContextType>({
  pathname: '/',
  search: '',
  navigate: () => {},
  outletElement: null,
  setOutletElement: () => {},
});

export const BrowserRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pathname, setPathname] = useState(window.location.pathname || '/');
  const [search, setSearch] = useState(window.location.search || '');
  const [outletElement, setOutletElement] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname || '/');
      setSearch(window.location.search || '');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string, options?: { replace?: boolean }) => {
    const [newPath, newSearch] = to.split('?');
    const targetPath = newPath || '/';
    const targetSearch = newSearch ? `?${newSearch}` : '';

    if (options?.replace) {
      window.history.replaceState(null, '', to);
    } else {
      window.history.pushState(null, '', to);
    }
    setPathname(targetPath);
    setSearch(targetSearch);
  };

  return (
    <RouterContext.Provider
      value={{ pathname, search, navigate, outletElement, setOutletElement }}
    >
      {children}
    </RouterContext.Provider>
  );
};

export interface RouteProps {
  path?: string;
  element: React.ReactNode;
  children?: React.ReactNode;
}

export const Route: React.FC<RouteProps> = () => {
  return null;
};

export const Routes: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname, setOutletElement } = useContext(RouterContext);

  const matchedContent = useMemo(() => {
    const childArray = React.Children.toArray(children) as React.ReactElement<RouteProps>[];

    for (const child of childArray) {
      if (!child.props) continue;

      // Handle nested layout route
      if (child.props.children) {
        const subRoutes = React.Children.toArray(child.props.children) as React.ReactElement<RouteProps>[];
        let subMatch: React.ReactNode = null;

        for (const sub of subRoutes) {
          const subPath = sub.props.path;
          if (subPath === pathname || (subPath === '/' && (pathname === '/' || pathname === ''))) {
            subMatch = sub.props.element;
            break;
          }
          if (subPath === '*' && !subMatch) {
            subMatch = sub.props.element;
          }
        }

        if (subMatch) {
          setOutletElement(subMatch);
          return child.props.element;
        }
      }

      // Top-level route
      if (child.props.path === pathname || child.props.path === '*') {
        return child.props.element;
      }
    }
    return null;
  }, [children, pathname, setOutletElement]);

  return <>{matchedContent}</>;
};

export const Outlet: React.FC = () => {
  const { outletElement } = useContext(RouterContext);
  return <>{outletElement}</>;
};

export const Navigate: React.FC<{ to: string; replace?: boolean }> = ({ to, replace }) => {
  const { navigate } = useContext(RouterContext);
  useEffect(() => {
    navigate(to, { replace });
  }, [to, replace, navigate]);
  return null;
};

export const useNavigate = () => {
  const { navigate } = useContext(RouterContext);
  return navigate;
};

export const useLocation = () => {
  const { pathname, search } = useContext(RouterContext);
  return { pathname, search, hash: window.location.hash };
};

export const useSearchParams = (): [
  URLSearchParams,
  (params: Record<string, string> | URLSearchParams, options?: { replace?: boolean }) => void
] => {
  const { search, pathname, navigate } = useContext(RouterContext);
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);

  const setSearchParams = (
    params: Record<string, string> | URLSearchParams,
    options?: { replace?: boolean }
  ) => {
    const nextParams =
      params instanceof URLSearchParams
        ? params.toString()
        : new URLSearchParams(params).toString();
    const newUrl = `${pathname}${nextParams ? `?${nextParams}` : ''}`;
    navigate(newUrl, options);
  };

  return [searchParams, setSearchParams];
};

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
}

export const Link: React.FC<LinkProps> = ({ to, children, onClick, ...props }) => {
  const { navigate } = useContext(RouterContext);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey) {
      e.preventDefault();
      navigate(to);
    }
  };

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};

export interface NavLinkProps extends Omit<LinkProps, 'className'> {
  className?: string | ((props: { isActive: boolean }) => string);
}

export const NavLink: React.FC<NavLinkProps> = ({ to, className, children, ...props }) => {
  const { pathname } = useContext(RouterContext);
  const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));

  const resolvedClass =
    typeof className === 'function' ? className({ isActive }) : className;

  return (
    <Link to={to} className={resolvedClass} {...props}>
      {children}
    </Link>
  );
};
