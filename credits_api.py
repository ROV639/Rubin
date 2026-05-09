"""
MiniMax Credits + Generation API Server
运行: python3 credits_api.py
端口: 18793
用途: 提供统一的额度查询+生成API，供Davinci Studio和Hermes调用
"""

from flask import Flask, jsonify, request
import requests
import json
import os
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path

app = Flask(__name__)

MINIMAX_API_KEY = "sk-cp-iuHf2bXdHr2OR6UsMIBpZz1lk8Qgf8sjon8ONR5znJ4JkyqZhL-_l4yF4El4pZQvB2Liw87xTK0gpV-OP-6fz6Wx55UxuFsKgYYDLtOmI6J3mYpLZw2L7os"
LAOZHANG_API_KEY = "sk-Qm3byvB0lWAG2ZLv361c0f776f124c499901F74574653a4a"

HISTORY_FILE = Path(__file__).parent / "davinci_history.json"

# ===== 工具函数 =====
def fmt_remains(ms):
    if ms == 0: return 'N/A'
    s = int(ms / 1000)
    h = s // 3600
    m = (s % 3600) // 60
    d = h // 24
    if d > 0: return f'{d}d{h%24}h'
    return f'{h}h{m}m'

def fmt_window(start_ms, end_ms):
    if start_ms == 0 or end_ms == 0: return 'N/A'
    tz_cst = timezone(timedelta(hours=8))
    s = datetime.fromtimestamp(start_ms / 1000, tz=tz_cst)
    e = datetime.fromtimestamp(end_ms / 1000, tz=tz_cst)
    diff_hours = (e - s).total_seconds() / 3600
    if diff_hours == 5: return f'{s.strftime("%H:%M")}-{e.strftime("%H:%M")} (5h)'
    elif diff_hours <= 24: return f'{s.strftime("%m/%d %H:%M")}-{e.strftime("%m/%d %H:%M")} (日)'
    return f'{s.strftime("%m/%d %H:%M")}-{e.strftime("%m/%d %H:%M")} (周)'

def save_history(item):
    history = []
    if HISTORY_FILE.exists():
        try:
            history = json.loads(HISTORY_FILE.read_text())
        except:
            history = []
    history.insert(0, item)
    history = history[:100]  # 最多100条
    HISTORY_FILE.write_text(json.dumps(history, ensure_ascii=False, indent=2))

def load_history():
    if not HISTORY_FILE.exists():
        return []
    try:
        return json.loads(HISTORY_FILE.read_text())
    except:
        return []

def now_str():
    return datetime.now().strftime('%m/%d %H:%M')

# ===== 额度查询 =====
@app.route('/credits/minimax', methods=['GET'])
def get_minimax_credits():
    try:
        resp = requests.get(
            'https://www.minimaxi.com/v1/api/openplatform/coding_plan/remains',
            headers={'Authorization': f'Bearer {MINIMAX_API_KEY}', 'Content-Type': 'application/json'},
            timeout=10
        )
        data = resp.json()
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    models = data.get('model_remains', [])
    UNAVAILABLE = {'MiniMax-Hailuo-2.3-Fast-6s-768p', 'MiniMax-Hailuo-2.3-6s-768p', 'music-2.5'}

    result = {'image': {}, 'tts': {}, 'music': {}, 'text': {}, 'updated_at': datetime.now().isoformat()}

    for m in models:
        raw_name = m.get('model_name', '')
        if raw_name in UNAVAILABLE: continue

        dt = m.get('current_interval_total_count', 0)
        du = m.get('current_interval_usage_count', 0) if dt > 0 else 0
        used = dt - du if dt > 0 else 0
        pct = used / dt * 100 if dt > 0 else 0

        wt = m.get('current_weekly_total_count', 0)
        wu = m.get('current_weekly_usage_count', 0) if wt > 0 else 0
        wused = wt - wu if wt > 0 else 0

        remains_ms = m.get('remains_time', 0)
        start_ms = m.get('start_time', 0)
        end_ms = m.get('end_time', 0)

        entry = {
            'total': dt or wt,
            'used': used or wused,
            'remaining': du or wu,
            'pct': round(pct, 1),
            'reset_in': fmt_remains(remains_ms),
            'window': fmt_window(start_ms, end_ms)
        }

        if raw_name == 'image-01':
            result['image']['daily'] = entry
            if wt > 0:
                entry2 = {
                    'total': wt, 'used': wused, 'remaining': wu,
                    'pct': round(wused / wt * 100, 1),
                    'reset_in': fmt_remains(m.get('weekly_remains_time', 0)),
                    'window': fmt_window(m.get('weekly_start_time', 0), m.get('weekly_end_time', 0))
                }
                result['image']['weekly'] = entry2
        elif 'speech' in raw_name:
            result['tts'] = entry
        elif 'music' in raw_name:
            result['music'][raw_name] = entry
        elif 'lyrics' in raw_name:
            result['music']['lyrics'] = entry
        elif 'MiniMax-M' in raw_name:
            result['text'] = entry

    return jsonify(result)

@app.route('/credits/laozhang', methods=['GET'])
def get_laozhang_credits():
    try:
        resp = requests.get(
            'https://api.laozhang.ai/v1/balance',
            headers={'Authorization': f'Bearer {LAOZHANG_API_KEY}'},
            timeout=10
        )
        if resp.status_code == 200:
            return jsonify(resp.json())
        return jsonify({'error': 'failed', 'status': resp.status_code}), resp.status_code
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/credits/all', methods=['GET'])
def get_all_credits():
    result = {'minimax': {}, 'laozhang': {'balance': 0.47, 'images_left': 15}, 'timestamp': datetime.now().isoformat()}
    try:
        resp = requests.get('https://www.minimaxi.com/v1/api/openplatform/coding_plan/remains',
            headers={'Authorization': f'Bearer {MINIMAX_API_KEY}', 'Content-Type': 'application/json'}, timeout=10)
        data = resp.json()
        models = data.get('model_remains', [])
        for m in models:
            n = m.get('model_name', '')
            if n == 'image-01':
                dt = m.get('current_interval_total_count', 0)
                du = m.get('current_interval_usage_count', 0) if dt > 0 else 0
                result['minimax']['image'] = {'used': dt-du, 'total': dt, 'remaining': du, 'daily': True}
            if 'speech' in n:
                dt = m.get('current_interval_total_count', 0)
                du = m.get('current_interval_usage_count', 0) if dt > 0 else 0
                result['minimax']['tts'] = {'used': dt-du, 'total': dt, 'remaining': du}
    except: pass
    try:
        resp = requests.get('https://api.laozhang.ai/v1/balance',
            headers={'Authorization': f'Bearer {LAOZHANG_API_KEY}'}, timeout=10)
        if resp.status_code == 200:
            d = resp.json()
            result['laozhang'] = {'balance': d.get('balance', 0.47), 'images_left': int(d.get('balance', 0.47) / 0.03)}
    except: pass
    return jsonify(result)

# ===== 生成接口 =====
@app.route('/generate/image', methods=['POST'])
def gen_image():
    body = request.json or {}
    model = body.get('model', 'image-01')
    prompt = body.get('prompt', '')
    if not prompt:
        return jsonify({'error': 'prompt is required'}), 400

    # Laozhang GPT-Image-2
    if model == 'laozhang-gpt-image-2' or model == 'gpt-image-2':
        lz_body = {
            'model': 'gpt-image-2',
            'prompt': prompt,
            'size': body.get('size', '1024x1024'),
            'quality': 'high',
            'n': 1
        }
        ref_img = body.get('image')
        if ref_img:
            lz_body['image'] = ref_img
        try:
            resp = requests.post('https://api.laozhang.ai/v1/images/generations',
                headers={'Authorization': f'Bearer {LAOZHANG_API_KEY}', 'Content-Type': 'application/json'},
                json=lz_body, timeout=30)
            if not resp.ok:
                return jsonify({'error': resp.json().get('error', {}).get('message', resp.text)}), resp.status_code
            d = resp.json()
            img = d.get('data', [{}])[0] if d.get('data') else {}
            url = img.get('url') or (img.get('b64_json') and f"data:image/png;base64,{img['b64_json']}")
            if not url:
                return jsonify({'error': 'no image in response'}), 500
            item = {
                'id': str(uuid.uuid4())[:8],
                'type': 'image', 'url': url,
                'prompt': prompt, 'model': 'GPT-Image-2',
                'size': lz_body['size'], 'cost': 0.03,
                'time': now_str(), 'provider': 'laozhang'
            }
            save_history(item)
            return jsonify(item)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    # MiniMax
    ratio = body.get('ratio', '3:4')
    style = body.get('style', '')
    optimizer = body.get('optimizer', False)
    watermark = body.get('watermark', False)
    ref_file = body.get('image_file')  # base64

    full_prompt = f"{prompt}, {style}" if style else prompt

    mb = {
        'model': model,
        'prompt': full_prompt,
        'aspect_ratio': ratio,
        'prompt_optimizer': optimizer,
        'aigc_watermark': watermark,
        'response_format': 'url',
        'n': 1
    }

    files = {}
    if ref_file:
        files['image_file'] = ('ref.png', ref_file, 'image/png') if ref_file.startswith('data:') else ('ref.png', ref_file.encode(), 'image/png')

    try:
        resp = requests.post('https://api.minimaxi.com/v1/image_generation',
            headers={'Authorization': f'Bearer {MINIMAX_API_KEY}'},
            data=mb, files=files if files else None, timeout=30)
        if not resp.ok:
            return jsonify({'error': resp.json().get('message', resp.text)}), resp.status_code
        d = resp.json()
        url = d.get('data', {}).get('image_urls', [None])[0] if d.get('data') else None
        if not url:
            return jsonify({'error': 'no image in response'}), 500
        item = {
            'id': str(uuid.uuid4())[:8],
            'type': 'image', 'url': url,
            'prompt': full_prompt, 'model': model,
            'ratio': ratio, 'style': style,
            'optimizer': optimizer, 'watermark': watermark,
            'cost': 0, 'time': now_str(), 'provider': 'minimax'
        }
        save_history(item)
        return jsonify(item)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate/music', methods=['POST'])
def gen_music():
    body = request.json or {}
    prompt = body.get('prompt', '')
    genre = body.get('genre', '')
    mood = body.get('mood', '')
    tempo = body.get('tempo', '')
    instrument = body.get('instrument', '')
    vocal = body.get('vocal', '')
    duration = body.get('duration', 60)
    lyrics = body.get('lyrics', '')
    instrumental = body.get('instrumental', False)
    model = body.get('model', 'music-2.6')

    parts = [prompt, genre, mood, tempo, instrument, vocal]
    full_prompt = ', '.join(p for p in parts if p)

    mb = {
        'model': model,
        'prompt': full_prompt,
        'output_format': 'url',
        'duration': int(duration)
    }
    if lyrics:
        mb['lyrics'] = lyrics
    if instrumental:
        mb['is_instrumental'] = True

    try:
        resp = requests.post('https://api.minimaxi.com/v1/music_generation',
            headers={'Authorization': f'Bearer {MINIMAX_API_KEY}', 'Content-Type': 'application/json'},
            json=mb, timeout=60)
        if not resp.ok:
            return jsonify({'error': resp.json().get('message', resp.text)}), resp.status_code
        d = resp.json()
        url = d.get('data', {}).get('audio_url') if d.get('data') else None
        if not url:
            return jsonify({'error': 'no audio in response'}), 500
        item = {
            'id': str(uuid.uuid4())[:8],
            'type': 'music', 'url': url,
            'prompt': full_prompt, 'model': model,
            'genre': genre, 'mood': mood, 'tempo': tempo,
            'instrument': instrument, 'vocal': vocal,
            'duration': duration, 'lyrics': lyrics,
            'cost': 0, 'time': now_str(), 'provider': 'minimax'
        }
        save_history(item)
        return jsonify(item)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate/tts', methods=['POST'])
def gen_tts():
    body = request.json or {}
    text = body.get('text', '')
    if not text:
        return jsonify({'error': 'text is required'}), 400

    voice_id = body.get('voice_id', 'male-qn-qingse')
    emotion = body.get('emotion', 'auto')
    speed = float(body.get('speed', 1.0))
    fmt = body.get('format', 'wav')

    mb = {
        'model': 'speech-2.8-hd',
        'text': text,
        'output_format': fmt,
        'voice_setting': {
            'voice_id': voice_id,
            'speed': speed,
            'emotion': emotion,
            'vol': 1,
            'pitch': 0
        }
    }

    try:
        resp = requests.post('https://api.minimaxi.com/v1/t2a_v2',
            headers={'Authorization': f'Bearer {MINIMAX_API_KEY}', 'Content-Type': 'application/json'},
            json=mb, timeout=30)
        if not resp.ok:
            return jsonify({'error': resp.json().get('message', resp.text)}), resp.status_code
        d = resp.json()
        hex_audio = d.get('data', {}).get('audio') if d.get('data') else None
        if not hex_audio:
            return jsonify({'error': 'no audio in response'}), 500
        # 返回 hex，让前端转 binary
        item = {
            'id': str(uuid.uuid4())[:8],
            'type': 'audio',
            'audio_hex': hex_audio,
            'format': fmt,
            'prompt': text,
            'model': voice_id,
            'emotion': emotion,
            'speed': speed,
            'cost': 0, 'time': now_str(), 'provider': 'minimax'
        }
        save_history(item)
        return jsonify(item)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== 历史记录 =====
@app.route('/history', methods=['GET'])
def get_history():
    limit = request.args.get('limit', 50, type=int)
    history = load_history()
    return jsonify({'items': history[:limit], 'total': len(history)})

@app.route('/history/clear', methods=['POST'])
def clear_history():
    HISTORY_FILE.write_text('[]')
    return jsonify({'ok': True})

# ===== 健康检查 =====
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'port': 18793})

if __name__ == '__main__':
    # Check for SSL cert files
    cert_path = Path('/tmp/cert.pem')
    key_path = Path('/tmp/key.pem')
    if cert_path.exists() and key_path.exists():
        app.run(host='0.0.0.0', port=18793, debug=False, ssl_context=(str(cert_path), str(key_path)))
    else:
        app.run(host='0.0.0.0', port=18793, debug=False)
