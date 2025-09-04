export class CourseWSController {
  static router(io) {
    io.of("/course").on("connection", (socket) => {
      socket.on("test", () => {
        console.log(1);
      });
    });
  }
}
