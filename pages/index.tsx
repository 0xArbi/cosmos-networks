import { chainRegistryChainToKeplr } from "@chain-registry/keplr";
import { Chain } from "@chain-registry/types";
import { Switch } from "@headlessui/react";
import { Keplr } from "@keplr-wallet/types";
import registry, { assets } from "chain-registry";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { NetworkIcon } from "../components";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function Filter({
  checked,
  onChange,
  text,
}: {
  text: string;
  checked: boolean;
  onChange: (x: boolean) => void;
}) {
  return (
    <Switch.Group as="div" className="flex items-center">
      <Switch
        checked={checked}
        onChange={onChange}
        className={classNames(
          checked ? "bg-indigo-600" : "bg-gray-200",
          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        )}
      >
        <span
          aria-hidden="true"
          className={classNames(
            checked ? "translate-x-5" : "translate-x-0",
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
          )}
        />
      </Switch>
      <Switch.Label as="span" className="ml-3">
        <span className="text-sm font-medium text-gray-900">{text}</span>
      </Switch.Label>
    </Switch.Group>
  );
}

export default function Home() {
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const [testnets, setTestnets] = useState(false);

  const onKeplr = async (wallet: "keplr" | "cosmostation", chain: Chain) => {
    if (wallet === "keplr" && !window.keplr) {
      toast.error("Keplr not installed");
      return;
    }

    // @ts-expect-error
    if (wallet === "cosmostation" && !window.cosmostation) {
      toast.error("Keplr not installed");
      return;
    }

    try {
      const config = chainRegistryChainToKeplr(chain, registry.assets);
      if (config.features) {
        // @ts-expect-error
        config.features = config.features.filter((x) => x !== "stargate");
      }

      const provider: Keplr =
        // @ts-expect-error
        wallet === "keplr" ? window.keplr : window.cosmostation.providers.keplr;
      await provider.experimentalSuggestChain(config);
      toast.success(`${chain.pretty_name} added`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    const f = (event: KeyboardEvent) => {
      if (event.key === "/") {
        if (document.getElementById("search") !== document.activeElement) {
          event.preventDefault();
          document.getElementById("search")?.focus();
        } else {
          return true;
        }
      }
    };
    window.addEventListener("keydown", f);
    return () => {
      window.removeEventListener("keydown", f);
    };
  });

  let chains = registry.chains.filter((x) =>
    testnets ? x.network_type === "testnet" : x.network_type !== "testnet"
  );

  if (search) {
    chains = chains.filter(
      (x) =>
        x.pretty_name.toLowerCase().includes(search.toLowerCase()) ||
        x.chain_id.toLowerCase().includes(search.toLowerCase()) ||
        x.chain_name.toLowerCase().includes(search.toLowerCase())
    );
  }

  return (
    <div className="max-w-screen-lg mx-auto pt-24 pb-12 space-y-6">
      <Head>
        <title>Cosmos Network Helper</title>
        <meta
          name="description"
          content="Website for adding Cosmos networks to your wallet of choice"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <div className="text-3xl font-bold text-center">
          Cosmos Network Helper
        </div>

        <div className="text-center text-sm text-gray-700 mt-4">
          Click any of the following chains to add them to your wallet!
        </div>
      </div>

      <div className="max-w-screen-sm mx-auto flex items-center space-x-4 w-full">
        <div className="relative flex-1 items-center">
          <input
            ref={searchRef}
            type="text"
            name="search"
            id="search"
            value={search}
            placeholder="Search"
            className="block w-full rounded-md border-gray-300 pr-12 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
            <kbd className="inline-flex items-center rounded border border-gray-200 px-2 font-sans text-sm font-medium text-gray-400">
              /
            </kbd>
          </div>
        </div>
        <Filter checked={testnets} onChange={setTestnets} text="Testnets" />
      </div>

      <div className="max-w-screen-lg">
        <ul
          role="list"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {chains.map((c) => {
            const asset = assets.find((x) => x.chain_name === c.chain_name)
              ?.assets?.[0];
            return (
              <li
                key={c.chain_id}
                className="relative col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow"
              >
                <a
                  href={c.website}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute right-4 top-4 text-gray-700 hover:text-gray-900 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    className="w-3 h-3"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                    />
                  </svg>
                </a>

                <div className="flex w-full items-center justify-between space-x-6 p-6">
                  <div className="flex-1 truncate space-y-4">
                    <div className="flex items-center space-x-3">
                      <NetworkIcon name={c.chain_name} />
                      <h3 className="truncate text-sm font-medium text-gray-900">
                        {c.pretty_name}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2">
                      <div className="grid-span-1">
                        <div className="text-sm text-gray-700">Chain ID</div>
                        <div className="text-s">{c.chain_id}</div>
                      </div>
                      <div className="grid-span-1">
                        <div className="text-sm text-gray-700">Currency</div>
                        <div>{asset?.symbol}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center p-4 space-x-12 justify-center">
                  <button
                    className="text-indigo-600 hover:text-indigo-900 flex items-center"
                    onClick={() => onKeplr("keplr", c)}
                  >
                    <Image
                      src={`/keplr.png`}
                      width={24}
                      height={24}
                      alt="keplr"
                      className="rounded-sm"
                    />
                  </button>
                  <button
                    className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-2"
                    onClick={() => onKeplr("cosmostation", c)}
                  >
                    <Image
                      src={`/cosmostation.svg`}
                      width={24}
                      height={24}
                      alt="cosmostation"
                      className="rounded-sm"
                    />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
