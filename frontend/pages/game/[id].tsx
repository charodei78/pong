import React, { useLayoutEffect, useState, useRef, useCallback, useEffect } from "react";
import { InnerPageLayout } from "../../layout/InnerPageLayout";
import io from "socket.io-client";
import { useRouter } from "next/router";
import useUser from "../../hooks/useUser";
import { Canvas } from "../../helpers/GameCanvas";
import useKeypress from "../../hooks/useKeypress";
import zIndex from "@material-ui/core/styles/zIndex";

export enum MoveDirectionEnum {
  UP = 'up',
  DOWN = 'down'
}


//# sourceMappingURL=canvas.js.map
export default function Game(): JSX.Element {
  const router = useRouter();
  const user = useUser();

  const { id: gameId } = router.query;
  
  // https://stackoverflow.com/questions/54346040/react-hooks-ref-is-not-avaiable-inside-useeffect/54346500
  const gameRef = useCallback((nodeRef) => {
    if (!gameId) return;
    // nodeRef = gameRef.current
    if (nodeRef !== null) {
      const socket = io("ws://" + process.env.GAME_API_HOST, {
        extraHeaders: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });

      let num = -1;
      const screen = [
        new Canvas(nodeRef, { zIndex: 1 }),
        new Canvas(nodeRef, { zIndex: 2 }),
        new Canvas(nodeRef, { zIndex: 3 }),
      ];
      screen[0].fill("#104c87");
      screen[0].drawRectangle(
        screen[0].canvasEl.width / 2 - 2,
        0,
        4,
        screen[0].canvasEl.height,
        "#000000"
      );

      socket.on('gameConnected', (response: GameConnectedResponse) => {
        const playersId = response.playersId;
      
        let isPlayer = playersId.includes(user.id);
        if (!isPlayer)
          return;

        socket.on('connectedAsPlayer', () => {
          console.log('connectedAsPlayer');
          const onKeyDown = (e) => {
            e.preventDefault();
            if (e.key == "ArrowUp") socket.emit("gamePlayerMove", MoveDirectionEnum.UP);
            else if (e.key == "ArrowDown") socket.emit("gamePlayerMove", MoveDirectionEnum.DOWN);
            else if (e.key == " ") socket.emit('playerReady');
          }
          document.addEventListener("keydown", onKeyDown);
        })
        socket.emit('connectAsPlayer');
      })

      socket.on('error', (e) => {
        console.log(e);
        
      })
      
      socket.emit("connectToGame", { id: gameId });


      socket.on('newFrame', (args) => {
        const [pl1x, pl1y, pl2x, pl2y, ballx, bally] = args
        screen[1].clear();
        screen[1].drawRectangle(pl1x, pl1y, 10, 100, "#ff0000");
        screen[1].drawRectangle(pl2x, pl2y, 10, 100, "#00ff00");
        screen[1].drawCircle(ballx, bally, 15, "#ff00ff");
        console.log(pl1x);
        
      });
      socket.on("goal", (score) => {
        screen[2].clear();
        screen[2].drawScore(screen[2].canvasEl.width * 0.25, score[0], "#ff0000");
        screen[2].drawScore(screen[2].canvasEl.width * 0.75, score[1], "#00ff00");
      });
      socket.on("waitForReconnect", (ready) => {
        console.log("waitForReconnect");
        screen[1].waitScreen("reconnect");
      });
      socket.on("win", (pl) => {
        console.log("win");
        screen[2].fill("#000000");
        screen[2].write(
          screen[2].canvasEl.width / 2 - 50,
          screen[2].canvasEl.height / 2 + 20,
          "Player " + pl + " wins",
          "#ffffff"
        );
      });

      socket.on("ready", (playerNumber: number) => {
        screen[2].write(
          screen[1].canvasEl.width / 2 - 60,
          screen[1].canvasEl.height / 2 - 20 + num * 20,
          "Player " + (playerNumber + 1) + " ready!",
          "#000000"
        );
      });
    }
    //# sourceMappingURL=client.js.map
  }, [gameId, user]);

  return (
    <InnerPageLayout>
      <div className="wrapper">
        <div ref={gameRef}></div>
      </div>
    </InnerPageLayout>
  );
}


type GameConnectedResponse = { playersId: number[] }
