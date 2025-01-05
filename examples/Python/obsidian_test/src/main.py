import json
import re
import sys
import typer

import requests
from bs4 import BeautifulSoup

def main():
    args = sys.argv[1:]  # Exclude the script name
    for arg in args:
        print(f"- Argument: '{arg}'")

app = typer.Typer()

def scrapeit():

    args = sys.argv[1:]  # Exclude the script name
    json_arg = json.loads(args[0])

    print("# " + json_arg["filenameFull"])

    URL = "https://realpython.github.io/fake-jobs/"
    page = requests.get(URL)

    soup = BeautifulSoup(page.content, "html.parser")
    results = soup.find(id="ResultsContainer")

    python_jobs = results.find_all(
        "h2", string=lambda text: "python" in text.lower()
    )

    python_job_cards = [
        h2_element.parent.parent.parent for h2_element in python_jobs
    ]

    for job_card in python_job_cards:
        title_element = job_card.find("h2", class_="title")
        company_element = job_card.find("h3", class_="company")
        location_element = job_card.find("p", class_="location")
        link_url = job_card.find_all("a")[1]["href"]
        print("### Job")
        print("- " + title_element.text.strip())
        print("- " + company_element.text.strip())
        print("- " + location_element.text.strip())
        print("- " + link_url.strip())


@app.command()
def scrape(
        url: str = typer.Option(help="URL to scrape", )
):
    scrapeit()




if __name__ == "__main__":
    scrapeit()
    # app()
