import React, { useEffect, useState } from "react";
import { isConnected } from "../utils/connects";
import idl from "../solanabackend.json";
import kp from "../keypair.json";
import { AnchorProvider, Program, web3 } from "@project-serum/anchor";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

const { SystemProgram, Keypair } = web3;

// create keypair for the account holding gif
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = Keypair.fromSecretKey(secret);

// getting program's ID
const programId = new PublicKey(idl.metadata.address);

// network config
const network = clusterApiUrl("devnet");

// TO-KNOW
const opts = {
  preflightCommitment: "processed",
};

const TEST_GIFS = [
  "https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp",
  "https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g",
  "https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g",
  "https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp",
];

const Intro = () => {
  const [address, setAddress] = useState(null);
  const [gifList, setGifList] = useState([]);
  const [value, setValue] = useState("");

  const connect = async () => {
    if (!address) {
      const { solana } = window;
      if (solana) {
        const res = await solana.connect();
        if (res.publicKey.toString()) {
          setAddress(res?.publicKey?.toString());
        } else return setAddress(null);
      }
    } else console.log(address);
  };

  const check = async () => {
    const conn = await isConnected();
    if (conn) setAddress(await isConnected(true));
  };

  useEffect(() => {
    check();
    if (address) {
      console.log(address);
      getGIFList();
    }
  }, [address]);

  const getProvider = async () => {
    const connnection = new Connection(network, opts.preflightCommitment);
    const provider = new AnchorProvider(
      connnection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const getGIFList = async () => {
    try {
      const provider = await getProvider();
      const program = new Program(idl, programId, provider);
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );

      console.log("got to the account");
      setGifList(account.gifLinks);
    } catch (e) {
      console.log(e);
      setGifList(null);
    }
  };

  const createGIFAccount = async () => {
    try {
      if (address) {
        const provider = await getProvider();
        const program = new Program(idl, programId, provider);
        console.log("ping");
        await program.rpc.startStuffOff({
          accounts: {
            baseAccount: baseAccount.publicKey,
            user: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId,
          },
          signers: [baseAccount],
        });

        console.log(
          "created account with pub key",
          baseAccount.publicKey.toString()
        );
        await getGIFList();
      }
    } catch (e) {
      console.log("error creating base account", e);
    }
  };

  const renderConnectedContainer = () => {
    if (gifList === null) {
      return (
        <div>
          <p
            onClick={createGIFAccount}
            className="bg-pink-600 p-3 rounded-lg shadow-xl cursor-pointer duration-500 hover:bg-violet-600 font-bold uppercase"
          >
            Do one time Initialisation
          </p>
        </div>
      );
    }
  };

  const addGif = async () => {
    try {
      const provider = await getProvider();
      const program = new Program(idl, programId, provider);

      await program.rpc.addGif(value, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });

      await getGIFList();
    } catch (error) {
      console.log(error);
    }
  };

  const likeGif = async (link) => {
    try {
      const provider = await getProvider();
      const program = new Program(idl, programId, provider);

      await program.rpc.likeGif(link, {
        accounts: { baseAccount: baseAccount.publicKey },
      });

      await getGIFList();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      {!address && (
        <div
          onClick={connect}
          className="bg-purple-500 p-3 px-10 rounded-lg shadow-xl text-white uppercase font-extrabold cursor-pointer duration-500 hover:bg-blue-800"
        >
          Connect Wallet
        </div>
      )}
      {gifList === null && renderConnectedContainer()}
      {gifList !== null && address && (
        <div className="w-full p-10 flex flex-col items-center h-full">
          <h1 className="text-5xl uppercase font-bold">GIF Portal</h1>
          {/* Container Input */}
          <div className="w-full flex justify-center items-center">
            <input
              type="text"
              className="w-3/6 mt-2 text-xl rounded-md text-blue-900 p-3"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <div className="flex items-center justify-center p-5">
              <p
                onClick={addGif}
                className="bg-orange-500 p-2 px-5 rounded cursor-pointer hover:bg-yellow-900 duration-500"
              >
                Submit
              </p>
            </div>
          </div>
          {/* GIFs */}
          <div className="w-full gif-grid">
            {gifList.map((i) => (
              <div key={i} className="mt-3 p-4 bg-slate-900 rounded-lg">
                <img src={i.gifLink} alt={i.gifLink} className="rounded" />
                <p className="mt-2 w-[40%] truncate rounded-full px-3 bg-gray-500">
                  {i?.userAddress.toString() || "?"}
                </p>
                <div
                  onClick={() => likeGif(i?.gifLink)}
                  className="bg-blue-500 inline-block  uppercase my-4 px-3 py-1 rounded-md duration-500 cursor-pointer hover:bg-blue-700 font-bold"
                >
                  Upvote
                </div>
                <div className="uppercase duration-500">
                  Likes: {i?.likes.toString()}
                </div>
                {console.log(gifList)}
                {console.log(i?.userAddress.toString())}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Intro;
