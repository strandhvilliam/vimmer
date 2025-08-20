// event-concurrency-test.js
import http from "k6/http"
import { check, sleep } from "k6"

export let options = {
  stages: [
    // { duration: "5s", target: 50 },
    // { duration: "5s", target: 200 },
    // { duration: "10s", target: 600 },
    { duration: "30s", target: 1000 },
    { duration: "15s", target: 500 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000"], // 95% of requests < 1s
    http_req_failed: ["rate<0.01"], // <1% errors
  },
}

let logged = false

export default function () {
  const url =
    "https://5lu7elbh67q3c6yjnv3lxtb7ty0sskhq.lambda-url.eu-north-1.on.aws/"
  // const url = "http://api.blikka.app/"
  // const url =
  //   "https://api.blikka.app/trpc/deviceGroups.getByDomain,competitionClasses.getByDomain,topics.getByDomain?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22domain%22%3A%22dev0%22%7D%7D%2C%221%22%3A%7B%22json%22%3A%7B%22domain%22%3A%22dev0%22%7D%7D%2C%222%22%3A%7B%22json%22%3A%7B%22domain%22%3A%22dev0%22%7D%7D%7D"

  //   const payload = JSON.stringify({
  //     id: 1,
  //     jsonrpc: "2.0",
  //     method: "query",
  //     params: { input: { name: "test" } },
  //   })

  //   const params = {
  //     headers: { "Content-Type": "application/json" },
  //   }

  let res = http.get(url)

  check(res, {
    "status is 200": (r) => r.status === 200,
    "latency < 1s": (r) => r.timings.duration < 1000,
  })

  // Optional: small sleep to simulate user think time
  sleep(1)
}
