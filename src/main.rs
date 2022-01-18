use actix_web::{get, post, http, web, App, HttpRequest, HttpResponse, HttpServer, Responder, Error};
use actix_web::http::header;
use json::JsonValue;
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct UrlJson {
    url: String,
}

#[post("/set")]
async fn set(req: HttpRequest, item: web::Json<UrlJson>) -> HttpResponse {
    println!("{:?}", req.peer_addr().unwrap());
    println!("{:?}", item.url);

    HttpResponse::Ok()
        .header(header::ACCESS_CONTROL_ALLOW_ORIGIN, "*")
        .body(format!("{:?}", req.peer_addr().unwrap()))
}


#[get("/get")]
async fn get(req: HttpRequest) -> HttpResponse {
    println!("{:?}", req.peer_addr().unwrap());

    HttpResponse::Ok()
        .header(header::ACCESS_CONTROL_ALLOW_ORIGIN, "*")
        .body(format!("{:?}", req.peer_addr().unwrap()))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(get)
            .service(set)
    })
        .bind(("127.0.0.1", 8080))?
        .run()
        .await;

    Ok(())
}