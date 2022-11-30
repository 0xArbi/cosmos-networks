import Head from "next/head";
import Image from "next/image";
import registry from "chain-registry";
import { Chain } from "@chain-registry/types";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { chainRegistryChainToKeplr } from "@chain-registry/keplr";
import { Keplr } from "@keplr-wallet/types";

// null = no sort
// true = desc
// false = asc
const nextStoreValue = (value: null | boolean) => {
  if (value === null) {
    return true;
  }
  if (value === true) {
    return false;
  }
  return null;
};

export default function Home() {
  const [sort, setSort] = useState<{
    property: "name" | "id";
    value: null | boolean;
  }>({ property: "name", value: true });
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

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

  const onClickSort = (property: "name" | "id") => {
    setSort((s) => ({
      property,
      value: s.property === property ? nextStoreValue(s.value) : true,
    }));
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

  let chains = registry.chains.sort((a, b) => {
    const aValue: string =
      sort.property === "name" ? a.pretty_name : a.chain_id;
    const bValue = sort.property === "name" ? b.pretty_name : b.chain_id;
    if (sort.value === null) {
      return 0;
    }
    if (sort.value === true) {
      return aValue.localeCompare(bValue);
    }
    return bValue.localeCompare(aValue);
  });
  if (search) {
    chains = chains.filter(
      (x) =>
        x.pretty_name.toLowerCase().includes(search.toLowerCase()) ||
        x.chain_id.toLowerCase().includes(search.toLowerCase()) ||
        x.chain_name.toLowerCase().includes(search.toLowerCase())
    );
  }

  return (
    <div className="max-w-screen-md mx-auto pt-24 pb-12">
      <Head>
        <title>Cosmos Network Helper</title>
        <meta
          name="description"
          content="Website for adding Cosmos networks to your wallet of choice"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="space-y-4">
        <div className="text-3xl font-bold text-center">
          Cosmos Network Helper
        </div>

        <div className="text-center text-sm text-gray-700">
          Click any of the following chains to add them to your wallet!
        </div>

        <div className="px-4 sm:px-6 lg:px-8">
          <div>
            <div className="relative mt-1 flex items-center">
              <input
                ref={searchRef}
                type="text"
                name="search"
                id="search"
                value={search}
                placeholder="cosmos"
                className="block w-full rounded-md border-gray-300 pr-12 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                <kbd className="inline-flex items-center rounded border border-gray-200 px-2 font-sans text-sm font-medium text-gray-400">
                  /
                </kbd>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:pl-6"
                        ></th>
                        <th
                          scope="col"
                          className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                        >
                          <button
                            className="inline-flex"
                            onClick={() => onClickSort("name")}
                          >
                            Name
                            <span className="ml-2 flex-none rounded text-gray-400">
                              {sort.property === "name" &&
                                sort.value === true && (
                                  <ChevronDownIcon
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                )}
                              {sort.property === "name" &&
                                sort.value === false && (
                                  <ChevronUpIcon
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                )}
                            </span>
                          </button>
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                        >
                          <button
                            className="inline-flex"
                            onClick={() => onClickSort("id")}
                          >
                            ID
                            <span className="ml-2 flex-none rounded text-gray-400">
                              {sort.property === "id" &&
                                sort.value === true && (
                                  <ChevronDownIcon
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                )}
                              {sort.property === "id" &&
                                sort.value === false && (
                                  <ChevronUpIcon
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                )}
                            </span>
                          </button>
                        </th>

                        <th
                          scope="col"
                          className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500"
                        >
                          Wallet
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {chains.map((c) => (
                        <tr key={c.chain_id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            <img
                              className="h-4 w-4 rounded-md"
                              src={
                                c.logo_URIs?.png ??
                                c.logo_URIs?.jpeg ??
                                c.logo_URIs?.svg
                              }
                            />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {c.pretty_name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {c.chain_id}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 flex items-center space-x-4">
                            <button
                              className="text-indigo-600 hover:text-indigo-900 flex items-center"
                              onClick={() => onKeplr("keplr", c)}
                            >
                              <Image
                                src={`/keplr.png`}
                                width={20}
                                height={20}
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
                                width={20}
                                height={20}
                                alt="cosmostation"
                                className="rounded-sm"
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
