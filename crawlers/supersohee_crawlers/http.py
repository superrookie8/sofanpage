import time
from urllib.parse import urljoin, urlsplit

import requests


class BoundedHttpClient:
    def __init__(self, allowed_hosts: set[str], timeout: float = 10, retries: int = 2, pace_seconds: float = 1):
        if not 1 <= timeout <= 30:
            raise ValueError("timeout must be between 1 and 30 seconds")
        if not 0 <= retries <= 3:
            raise ValueError("retries must be between 0 and 3")
        if pace_seconds < 0:
            raise ValueError("pace_seconds must not be negative")
        self.allowed_hosts = allowed_hosts
        self.timeout = timeout
        self.retries = retries
        self.pace_seconds = pace_seconds
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": "SupersoheeArticleCrawler/1.0"})
        self._last_request_at = 0.0

    def get(self, url: str, params: dict | None = None) -> str:
        self._check_url(url)
        return self._request_text(lambda: self._get_with_safe_redirects(url, params))

    def post_form(self, url: str, data: dict) -> str:
        """Submit a read-only search form without allowing a cross-host redirect."""
        self._check_url(url)
        return self._request_text(lambda: self._post_form_without_redirect(url, data))

    def _request_text(self, request) -> str:
        error: Exception | None = None
        for attempt in range(self.retries + 1):
            self._pace()
            try:
                response = request()
                if response.status_code == 429 or response.status_code >= 500:
                    raise requests.HTTPError(f"retryable HTTP {response.status_code}")
                response.raise_for_status()
                return response.text
            except (
                requests.Timeout,
                requests.ConnectionError,
                requests.HTTPError,
                requests.TooManyRedirects,
            ) as exc:
                error = exc
                if attempt == self.retries:
                    break
                time.sleep(min(2 ** attempt, 4))
        raise RuntimeError(f"request failed after {self.retries + 1} attempts") from error

    def _post_form_without_redirect(self, url: str, data: dict):
        response = self.session.post(
            url,
            data=data,
            timeout=self.timeout,
            allow_redirects=False,
        )
        if response.is_redirect or response.is_permanent_redirect:
            location = response.headers.get("Location")
            if location:
                self._check_url(urljoin(url, location))
            raise requests.TooManyRedirects("search form POST redirect is not supported")
        return response

    def _get_with_safe_redirects(self, url: str, params: dict | None):
        current_url = url
        current_params = params
        for _ in range(4):
            response = self.session.get(
                current_url,
                params=current_params,
                timeout=self.timeout,
                allow_redirects=False,
            )
            if response.is_redirect or response.is_permanent_redirect:
                location = response.headers.get("Location")
                if not location:
                    return response
                current_url = urljoin(current_url, location)
                self._check_url(current_url)
                current_params = None
                continue
            return response
        raise requests.TooManyRedirects("more than three redirects")

    def _check_url(self, url: str) -> None:
        parsed = urlsplit(url)
        if parsed.scheme != "https" or parsed.hostname not in self.allowed_hosts:
            raise ValueError("URL host is not allowed")

    def _pace(self) -> None:
        wait = self.pace_seconds - (time.monotonic() - self._last_request_at)
        if wait > 0:
            time.sleep(wait)
        self._last_request_at = time.monotonic()
