#![feature(proc_macro_hygiene, decl_macro)]
#[macro_use] extern crate rocket;

extern crate redis;

use std::io::Read;
use std::net::SocketAddr;
use rocket::http::Status;
use rocket::{Data, Outcome, Request, request};
use rocket::response::{content, status};
use redis::Commands;
use rocket::request::FromRequest;
use url::{Url, ParseError};


// BEWARE: this is like the second thing i've ever written in rust so its horrible.

#[get("/get")]
fn get(remote_addr: SocketAddr) -> String {
    let url = "https://google.com".to_string();
    println!("{}", &remote_addr);

    // let client = redis::Client::open("redis://127.0.0.1/")?;

    format!("{}, {}", remote_addr, url)
}

#[post("/set", data = "<url>")]
fn set(url: Data, remote_addr: SocketAddr) -> String {
    let mut stream = url.open();
    let mut buffer = String::new();
    stream.read_to_string(&mut buffer).unwrap();
    let url = Url::parse(&buffer).unwrap();
    println!("{}", url);
    println!("{}", remote_addr);
    buffer
}


fn main() {
    rocket::ignite().mount("/", routes![get, set]).launch();
}
