import React, { useState, useEffect, startTransition } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LIVESTOCK_CATS, PET_CATS } from '../constants/index';
import { uploadToCloudinary } from '../lib/cloudinary';
import toast from 'react-hot-toast';
import './SellPage.css';

// Boost tiers moved to constants if needed, otherwise kept here as comments
// ...

const formatPrice = (val) => {
    if (!val && val !== 0) return '';
    return Number(val).toLocaleString('en-IN');
};

const parsePrice = (val) => {
    return val.replace(/,/g, '').replace(/[^\d]/g, '');
};

// Fix #4: Category-specific breed lists
const BREED_OPTIONS = {
    cow: ['HF Holstein', 'Jersey', 'Gir', 'Sahiwal', 'Red Sindhi', 'Tharparkar', 'Rathi', 'Kankrej', 'Ongole', 'Hariana', 'Crossbred HF', 'Crossbred Jersey', 'Indigenous Mixed', 'Other'],
    buffalo: ['Murrah', 'Mehsana', 'Jaffarabadi', 'Surti', 'Nagpuri', 'Pandharpuri', 'Bhadawari', 'Nili-Ravi', 'Other'],
    goat: ['Boer', 'Jamunapari', 'Barbari', 'Sirohi', 'Beetal', 'Black Bengal', 'Osmanabadi', 'Malabari', 'Crossbred', 'Other'],
    sheep: ['Deccani', 'Madras Red', 'Nellore', 'Vembur', 'Bellary', 'Hassan', 'Mandya', 'Merino', 'Crossbred', 'Other'],
    horse: ['Marwari', 'Kathiawari', 'Sindhi', 'Bhutia', 'Spiti', 'Zanskari', 'Manipuri', 'Thoroughbred', 'Arabian', 'Other'],
    dog: ['Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'Beagle', 'Bulldog', 'Poodle', 'Rottweiler', 'Pug', 'Doberman', 'Husky', 'Indian Pariah', 'Indie (Mixed)', 'Other'],
    cat: ['Persian', 'Siamese', 'Maine Coon', 'British Shorthair', 'Indian Street Cat', 'Indie (Mixed)', 'Other'],
    bird: ['Parrot', 'Cockatiel', 'Budgerigar (Budgie)', 'Lovebird', 'Canary', 'Finch', 'Pigeon', 'Dove', 'Other'],
    fish: ['Goldfish', 'Koi', 'Betta (Fighting Fish)', 'Guppy', 'Molly', 'Angelfish', 'Oscar', 'Tetra', 'Catfish', 'Other'],
    rabbit: ['Dutch', 'Flemish Giant', 'Lionhead', 'Mini Lop', 'English Angora', 'Indian White', 'Other'],
};
function getBreedOptions(category) {
    return BREED_OPTIONS[category] || ['Other'];
}

// Fix #5 Helpers
function isLivestock(category) { return ['cow', 'buffalo', 'goat', 'sheep', 'horse'].includes(category); }
function isPet(category) { return ['dog', 'cat', 'bird', 'fish', 'rabbit'].includes(category); }
function showsMilkYield(category, gender) {
    // Only show milk yield for female cows & buffaloes
    return ['cow', 'buffalo'].includes(category) && gender === 'female';
}
function showsPregnancyStatus(category) { return ['cow', 'buffalo', 'goat', 'horse'].includes(category); }

function getTitlePlaceholder(category) {
    const map = {
        cow: 'e.g. HF Cow — High Milk Yield',
        buffalo: 'e.g. Murrah Buffalo — 14L Daily',
        goat: 'e.g. Boer Goat — Meat Breed',
        sheep: 'e.g. Deccani Sheep — 2 Years Old',
        horse: 'e.g. Marwari Horse — Well Trained',
        poultry: 'e.g. Country Hens — Batch of 10',
        other: 'e.g. Healthy Animal for Sale',
        dog: 'e.g. Labrador Puppy — Vaccinated',
        cat: 'e.g. Persian Cat — 1 Year Old',
        bird: 'e.g. Talking Parrot — Hand Tamed',
        fish: 'e.g. Koi Fish — Pair Available',
        rabbit: 'e.g. Dutch Rabbit — 6 Months Old',
        'other-pet': 'e.g. Friendly Pet for Adoption',
    };
    return map[category] || 'e.g. Animal Name — Key Detail';
}

function getDescriptionPlaceholder(category) {
    const map = {
        cow: 'Describe milk yield, feeding habits, health history, temperament...',
        buffalo: 'Describe daily milk yield, age, last calving date, health...',
        goat: 'Describe weight, feeding, health history, purpose (meat/dairy)...',
        sheep: 'Describe wool quality, weight, health, breeding history...',
        horse: 'Describe training level, temperament, health, riding experience...',
        poultry: 'Describe breed, quantity, age, egg production, feeding...',
        dog: 'Describe breed, temperament, training, vaccinations, diet...',
        cat: 'Describe breed, personality, vaccinations, indoor/outdoor...',
        bird: 'Describe talking ability, age, diet, cage included or not...',
        fish: 'Describe tank size, feeding, health, how many in the lot...',
        rabbit: 'Describe temperament, diet, vaccinations, cage included...',
    };
    return map[category] || 'Describe the animal — health, age, temperament, history...';
}

const INDIAN_STATES = [
    'Tamil Nadu', 'Maharashtra', 'Uttar Pradesh', 'Rajasthan',
    'Gujarat', 'Punjab', 'Haryana', 'Telangana', 'Karnataka',
    'Andhra Pradesh', 'Madhya Pradesh', 'Bihar',
    'Arunachal Pradesh', 'Assam', 'Chhattisgarh', 'Goa',
    'Himachal Pradesh', 'Jharkhand', 'Kerala', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Sikkim',
    'Tripura', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh',
    'Puducherry', 'Andaman & Nicobar', 'Dadra & Nagar Haveli',
    'Daman & Diu', 'Lakshadweep'
];

const STEPS = ['cattleType', 'details', 'photos', 'pricing'];

export default function SellPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser, guestPrefs, listingType: globalListingType } = useAuth();
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    // Use global toggle to decide if we start in livestock or pet mode
    const [listingType, setListingType] = useState(() =>
        globalListingType === 'pets' ? 'pets' : 'livestock'
    );
    const [imageWarning, setImageWarning] = useState(false);
    const [form, setForm] = useState({
        category: '',
        title: '',
        breed: '',
        customBreed: '', // NEW
        gender: '',      // NEW
        is_trained: false,  // NEW
        is_neutered: false, // NEW
        age_years: '',
        weight_kg: '',
        milk_yield_liters: '',
        is_vaccinated: false,
        is_pregnant: false,
        purpose: 'dairy',
        price: '',
        village: '',
        taluk: '',
        location: '',
        landmark: '',
        state: '',
        description: '',
        image_url: '',
        imageSkipped: false,
        for_adoption: false,
        is_promoted: false,
        boostPlanName: 'Premium',
    });

    function getWeightLimits(cat) {
        if (['cow', 'buffalo'].includes(cat)) return { min: 50, max: 1500 };
        if (['goat', 'sheep'].includes(cat)) return { min: 5, max: 150 };
        if (cat === 'dog') return { min: 2, max: 100 };
        if (cat === 'cat') return { min: 1, max: 15 };
        return { min: 1, max: 1500 };
    }

    useEffect(() => {
        if (isEditing) return;
        // Sync with global toggle on mount
        startTransition(() => {
            if (guestPrefs?.category === 'pets' || globalListingType === 'pets') {
                setListingType('pets');
            } else {
                setListingType('livestock');
            }
        });
    }, [guestPrefs?.category, globalListingType, isEditing]);

    // Check for edit mode on mount
    useEffect(() => {
        if (location.state?.editListing) {
            const l = location.state.editListing;
            setIsEditing(true);
            setStep(2); // Jump directly to details step

            setEditingId(l.id);
            const isPet = ['dog', 'cat', 'bird', 'fish', 'rabbit'].includes(l.category);
            setListingType(isPet ? 'pets' : 'livestock');

            const savedBreed = l.breed || '';
            const standardBreeds = getBreedOptions(l.category || '');
            const isCustomBreed = savedBreed && !standardBreeds.includes(savedBreed);

            setForm({
                category: l.category || '',
                title: l.title || '',
                breed: isCustomBreed ? 'Other' : savedBreed,
                customBreed: isCustomBreed ? savedBreed : (l.custom_breed || ''),
                gender: l.gender || '',
                is_trained: l.is_trained || false,
                is_neutered: l.is_neutered || false,
                age_years: l.age_years || '',
                weight_kg: l.weight_kg || '',
                milk_yield_liters: l.milk_yield_liters || '',
                is_vaccinated: l.is_vaccinated || false,
                is_pregnant: l.is_pregnant || false,
                purpose: l.purpose || 'dairy',
                price: l.price || '',
                village: l.village || '',
                taluk: l.taluk || '',
                location: l.location || '',
                landmark: l.landmark || '',
                state: l.state || '',
                description: l.description || '',
                image_url: l.image_url || '',
                imageSkipped: false,
                for_adoption: l.for_adoption || false,
                is_promoted: l.is_promoted || false,
                boostPlanName: 'Premium',
            });
        }
    }, [location.state]);

    function setF(key, val) { setForm(f => ({ ...f, [key]: val })); }

    // Clear milk yield field if gender is changed to male
    useEffect(() => {
        if (form.gender === 'male' && form.milk_yield_liters) {
            setF('milk_yield_liters', '');
        }
    }, [form.gender]); // eslint-disable-line react-hooks/exhaustive-deps

    async function uploadImage(file) {
        try {
            toast.loading('Uploading photo... 0%', { id: 'img-upload' });
            const url = await uploadToCloudinary(file, {
                folder: 'listing-images',
                onProgress: (pct) => {
                    toast.loading(`Uploading... ${pct}%`, { id: 'img-upload' });
                }
            });
            toast.dismiss('img-upload');
            return url;
        } catch (err) {
            toast.dismiss('img-upload');
            console.error('Unexpected upload error:', err);
            toast.error('Image upload failed: ' + err.message);
            return null;
        }
    }

    function validate() {
        const errs = {};
        if (!form.gender) errs.gender = 'Please select gender';
        if (form.title.trim().length < 5) errs.title = 'Title must be at least 5 characters';
        if (form.breed === 'Other' && !form.customBreed.trim()) errs.breed = 'Please specify the custom breed';
        if (!form.breed) errs.breed = 'Please select a breed';
        if (form.title.trim().length > 100) errs.title = 'Title must be under 100 characters';
        // BUG 1 Fix C — Image is required
        const hasRealImage = form.image_url && form.image_url.trim().length > 5;
        if (!hasRealImage) errs.image = 'Please upload a photo of your animal';
        if (!form.for_adoption && Number(form.price) <= 0) errs.price = 'Please enter an asking price';
        if (!form.for_adoption && Number(form.price) > 9999999) errs.price = 'Price cannot exceed ₹99,99,999';
        if (form.location.trim().length < 3) errs.location = 'Please enter a valid city';
        if (!form.state) errs.state = 'Please select your state';
        if (!form.village.trim()) errs.village = 'Please enter your village';
        else if (form.village.length > 100) errs.village = 'Village name too long (max 100 characters)';

        if (!form.taluk.trim()) errs.taluk = 'Please enter your taluk';
        else if (form.taluk.length > 100) errs.taluk = 'Taluk name too long (max 100 characters)';
        if (form.landmark.length > 150) errs.landmark = 'Landmark too long (max 150 characters)';
        // BUG 7 Fix C — strict trim check for description
        if (form.description.trim().length > 1000) errs.description = 'Description must be under 1000 characters';
        if (form.age_years === '' || form.age_years === null || form.age_years === undefined)
            errs.age = 'Please enter the age (in years)';
        else if (Number(form.age_years) > 25)
            errs.age = 'Age must be 25 years or less';
        if (form.weight_kg === '' || form.weight_kg === null || form.weight_kg === undefined)
            errs.weight = 'Please enter the weight (in kg)';
        else {
            const { min, max } = getWeightLimits(form.category);
            if (Number(form.weight_kg) < min || Number(form.weight_kg) > max)
                errs.weight = `Weight must be ${min}–${max} kg for this animal`;
        }
        setFieldErrors(errs);
        const firstErr = Object.values(errs)[0] || null;
        return firstErr ? { ok: false, msg: firstErr, field: Object.keys(errs)[0] } : { ok: true };
    }

    function canGoNext() {
        if (step === 1) return form.category !== '';
        if (step === 2) return form.title.trim().length >= 5 && form.breed.trim().length >= 1 && !!form.gender && form.age_years !== '' && form.weight_kg !== '';
        if (step === 3) {
            // Image is mandatory — must have a real uploaded URL
            return !!(form.image_url && form.image_url.trim().length > 5);
        }
        if (step === 4) return (form.price !== '' || form.for_adoption) && form.location.trim().length > 2 && !!form.state && form.village.trim().length > 1 && form.taluk.trim().length > 1;
        return true;
    }

    async function handleSubmit() {
        // If currentUser is null (async session not yet resolved), wait up to 5s
        let user = currentUser;
        if (!user) {
            const { data: { session } } = await supabase.auth.getSession();
            user = session?.user || null;
        }

        if (!user) {
            toast.error('Please log in first');
            navigate('/');
            return;
        }

        // Verify session is still valid
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            toast.error('Session expired. Please sign in again.');
            navigate('/login');
            return;
        }

        const result = validate();
        if (!result.ok) {
            if (result.field === 'title') setStep(2);
            if (result.field === 'image') setStep(3);
            toast.error('⚠️ ' + result.msg, { duration: 4000 });
            return;
        }

        setSubmitting(true);
        try {
            // BUG 2 Fix — Store village, taluk, city, landmark as separate columns
            const payload = {
                user_id: user.id,
                title: form.title.trim(),
                category: form.category,
                breed: form.breed === 'Other' ? (form.customBreed?.trim() || 'Other') : form.breed,
                custom_breed: form.breed === 'Other' ? form.customBreed.trim() : null,
                gender: form.gender,
                is_trained: form.is_trained,
                is_neutered: form.is_neutered,
                age_years: Number(form.age_years) || null,
                weight_kg: Number(form.weight_kg) || null,
                milk_yield_liters: Number(form.milk_yield_liters) || null,
                is_vaccinated: form.is_vaccinated,
                is_pregnant: form.is_pregnant,
                price: form.for_adoption ? 0 : Number(form.price),
                village: form.village.trim(),
                taluk: form.taluk.trim(),
                location: form.location.trim(),  // city only
                landmark: form.landmark.trim(),
                state: form.state.trim(),
                description: form.description.trim(),
                image_url: (form.image_url && form.image_url.trim().length > 5) ? form.image_url.trim() : null,
                for_adoption: form.for_adoption,
                is_promoted: form.is_promoted,
                status: 'active',
                created_at: new Date().toISOString(),
            };

            if (isEditing && editingId) {
                const { error } = await supabase
                    .from('listings')
                    .update({ ...payload, created_at: undefined })
                    .eq('id', editingId)
                    .eq('user_id', user.id);
                if (error) throw error;
                toast.success('Listing updated! ✓');
                navigate('/my-listings');
            } else {
                const { data, error } = await supabase
                    .from('listings')
                    .insert(payload)
                    .select()
                    .single();
                if (error) throw error;
                navigate('/success', {
                    state: {
                        listingId: data.id,
                        category: payload.category || 'livestock'
                    }
                });
            }
        } catch (err) {
            console.error('Submit error:', err);
            toast.error('Failed to save. Please try again: ' + err.message);
        } finally {
            setSubmitting(false);  // ALWAYS resets — no more stuck button
        }
    }

    return (
        <div className="sell-wrap">
            {/* Header */}
            <div className="sell-hd">
                <button className="btn-back" onClick={() => step > 1 ? setStep(s => s - 1) : navigate(isEditing ? '/my-listings' : '/')}>←</button>
                <div>
                    <div className="sell-ttl">
                        {isEditing ? t('sellPage.editListing') : (listingType === 'livestock' ? t('sellPage.sellCattle') : t('sellPage.sellPet'))}
                    </div>
                    <div className="sell-sub">{t('sellPage.stepOf', { step, total: STEPS.length })}: {t(`sellPage.${STEPS[step - 1]}`)}</div>
                </div>
            </div>

            {/* Stepper */}
            <div className="stepper">
                {STEPS.map((s, i) => (
                    <React.Fragment key={i}>
                        <div className="step-item">
                            <div className={`step-c${i + 1 < step ? ' done' : i + 1 === step ? ' act' : ''}`}>
                                {i + 1 < step ? '✓' : i + 1}
                            </div>
                            <span className={`step-lbl${i + 1 <= step ? ' act' : ''}`}>{t(`sellPage.${s}`)}</span>
                        </div>
                        {i < STEPS.length - 1 && <div className={`step-line${i + 1 < step ? ' done' : ''}`} />}
                    </React.Fragment>
                ))}
            </div>

            {step === 1 && (
                <div className="sell-section animate-fadeIn">
                    <h3>{t('sellPage.whatSelling')}</h3>
                    <div className="toggle-row" style={{ marginBottom: 30, marginTop: 15 }}>
                        {(guestPrefs?.category !== 'pets') && (
                            <button
                                className={`tbtn toggle-btn${listingType === 'livestock' ? ' active' : ''}`}
                                onClick={() => { setListingType('livestock'); setF('category', ''); }}
                            >
                                🐄 {t('homePage.cattle')}
                            </button>
                        )}
                        {(guestPrefs?.category !== 'livestock') && (
                            <button
                                className={`tbtn toggle-btn${listingType === 'pets' ? ' active' : ''}`}
                                onClick={() => { setListingType('pets'); setF('category', ''); }}
                            >
                                🐾 {t('homePage.pets')}
                            </button>
                        )}
                    </div>
                    <div>
                        <h4 style={{ marginBottom: 16, color: '#666' }}>
                            {listingType === 'livestock' ? t('sellPage.selectCattleType') : t('sellPage.selectPetType')}
                        </h4>
                        <div className="category-grid">
                            {(listingType === 'livestock' ? LIVESTOCK_CATS : PET_CATS).map(c => (
                                <div
                                    key={c.id}
                                    className={`category-card${form.category === c.id ? ' selected' : ''}`}
                                    onClick={() => setF('category', c.id)}
                                >
                                    <div className="cat-icon">{c.label}</div>
                                    <div className="cat-name">{c.name || t(`homePage.${c.id}`)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 2: Cattle Details */}
            {step === 2 && (
                <div className="animate-fadeIn">
                    <div className="fs ga">
                        <h3>{listingType === 'pets' ? t('sellPage.petDetails') : t('sellPage.cattleDetails')}</h3>
                        <div className="fg">
                            <div className="ff">
                                <label>{t('sellPage.listingTitle')} *</label>
                                <input placeholder={getTitlePlaceholder(form.category)} value={form.title} onChange={e => setF('title', e.target.value)} maxLength={100} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                    {fieldErrors.title ? <span style={{ color: '#e63946', fontSize: 12 }}>⚠️ {fieldErrors.title}</span> : <span />}
                                    <span style={{ fontSize: 11, color: form.title.length < 5 ? '#e63946' : 'var(--g3)' }}>{form.title.length}/100 (min 5)</span>
                                </div>
                            </div>
                            <div className="ff">
                                <label>{t('sellPage.breed')} *</label>
                                <select value={form.breed} onChange={(e) => setF('breed', e.target.value)} style={{ padding: '12px 14px', borderRadius: 8, border: '1.5px solid #ccc', outline: 'none' }}>
                                    <option value="">{t('sellPage.selectBreed')}</option>
                                    {getBreedOptions(form.category).map(b => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                </select>
                                {fieldErrors.breed && <div style={{ color: '#e63946', fontSize: 12, marginTop: 4 }}>⚠️ {fieldErrors.breed}</div>}
                                {form.breed === 'Other' && (
                                    <input type="text" placeholder={t('sellPage.specifyBreed')} value={form.customBreed} onChange={e => setF('customBreed', e.target.value)} maxLength={50} style={{ marginTop: 8 }} />
                                )}
                            </div>
                        </div>

                        <div className="ff" style={{ marginTop: 15, marginBottom: 15 }}>
                            <label>{t('sellPage.gender')} *</label>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button
                                    type="button"
                                    onClick={() => setF('gender', 'male')}
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: 10, fontSize: 18, fontWeight: 700,
                                        border: form.gender === 'male' ? '2px solid #1a7a3c' : '1.5px solid #ccc',
                                        background: form.gender === 'male' ? '#e8f5e9' : 'white',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                    }}
                                >
                                    ♂ {t('sellPage.male')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setF('gender', 'female')}
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: 10, fontSize: 18, fontWeight: 700,
                                        border: form.gender === 'female' ? '2px solid #e91e8c' : '1.5px solid #ccc',
                                        background: form.gender === 'female' ? '#fce4ec' : 'white',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                    }}
                                >
                                    ♀ {t('sellPage.female')}
                                </button>
                            </div>
                            {fieldErrors.gender && <span style={{ color: '#e63946', fontSize: 12, marginTop: 4, display: 'block' }}>⚠️ {fieldErrors.gender}</span>}
                        </div>

                        <div className="fg3">
                            <div className="ff">
                                <label>{t('sellPage.ageYears')} *</label>
                                <input type="number" placeholder="0" value={form.age_years} onChange={e => { const v = Math.min(25, Math.max(0, Number(e.target.value))); setF('age_years', v || ''); }} min={0} max={25} />
                                <small style={{ fontSize: 11, color: 'var(--g3)' }}>{t('sellPage.maxYears')}</small>
                                {fieldErrors.age && <div style={{ color: '#e63946', fontSize: 12, marginTop: 2 }}>⚠️ {fieldErrors.age}</div>}
                            </div>
                            <div className="ff">
                                <label>{t('sellPage.weightKg')} *</label>
                                <input type="number" placeholder="0" value={form.weight_kg} onChange={e => { const lim = getWeightLimits(form.category); const v = Math.min(lim.max, Math.max(0, Number(e.target.value))); setF('weight_kg', v || ''); }} min={0} max={getWeightLimits(form.category).max} />
                                <small style={{ fontSize: 11, color: 'var(--g3)' }}>
                                    {isLivestock(form.category) ? `${t('sellPage.range')}: ${getWeightLimits(form.category).min}–${getWeightLimits(form.category).max} kg` : t('sellPage.enterApprox')}
                                </small>
                                {fieldErrors.weight && <div style={{ color: '#e63946', fontSize: 12, marginTop: 2 }}>⚠️ {fieldErrors.weight}</div>}
                            </div>
                            {showsMilkYield(form.category, form.gender) && (
                                <div className="ff">
                                    <label>{t('sellPage.milkYieldLabel')}</label>
                                    <input type="number" placeholder="0" value={form.milk_yield_liters} onChange={e => { const v = Math.min(100, Math.max(0, Number(e.target.value))); setF('milk_yield_liters', v || ''); }} min={0} max={100} />
                                    <small style={{ fontSize: 11, color: 'var(--g3)' }}>Max 100 litres/day</small>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="fs oa" style={{ background: '#fff9f0', border: '1px solid #ffe8cc' }}>
                        <h3 style={{ color: '#ea580c' }}>{t('sellPage.healthStatus')}</h3>

                        <div className="fg" style={{ marginTop: 14 }}>
                            <div className="ff" style={{ flex: 1 }}>
                                <label style={{ color: '#9a3412', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{t('sellPage.isVaccinated')}</label>
                                <select
                                    value={form.is_vaccinated ? 'yes' : 'no'}
                                    onChange={e => setF('is_vaccinated', e.target.value === 'yes')}
                                    style={{ padding: '12px 14px', borderRadius: 8, border: '1.5px solid #fbd38d', outline: 'none', background: 'white', fontSize: 14 }}
                                >
                                    <option value="no">{t('sellPage.notVaccinated')}</option>
                                    <option value="yes">{t('sellPage.yesVaccinated')}</option>
                                </select>
                            </div>

                            {showsPregnancyStatus(form.category) && form.gender === 'female' && (
                                <div className="ff" style={{ flex: 1 }}>
                                    <label style={{ color: '#9a3412', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{t('sellPage.isPregnant')}</label>
                                    <select
                                        value={form.is_pregnant ? 'yes' : 'no'}
                                        onChange={e => setF('is_pregnant', e.target.value === 'yes')}
                                        style={{ padding: '12px 14px', borderRadius: 8, border: '1.5px solid #fbd38d', outline: 'none', background: 'white', fontSize: 14 }}
                                    >
                                        <option value="no">{t('sellPage.notPregnant')}</option>
                                        <option value="yes">{t('sellPage.yesPregnant')}</option>
                                    </select>
                                </div>
                            )}

                            {isPet(form.category) && (
                                <div className="ff" style={{ flex: 1 }}>
                                    <label style={{ color: '#9a3412', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>{t('sellPage.isTrained')}</label>
                                    <select
                                        value={form.is_trained ? 'yes' : 'no'}
                                        onChange={e => setF('is_trained', e.target.value === 'yes')}
                                        style={{ padding: '12px 14px', borderRadius: 8, border: '1.5px solid #fbd38d', outline: 'none', background: 'white', fontSize: 14 }}
                                    >
                                        <option value="no">{t('sellPage.notTrained')}</option>
                                        <option value="yes">{t('sellPage.yesTrained')}</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 3: Photos */}
            {step === 3 && (
                <div className="animate-fadeIn">
                    <div className="fs ba">
                        <h3>{t('sellPage.addPhotos')}</h3>
                        <p style={{ fontSize: 13, color: 'var(--g3)', marginBottom: 16 }}>
                            {t('sellPage.photoSubtitle')}
                        </p>

                        {/* Show upload zone OR large preview — image is mandatory */}
                        {form.image_url && form.image_url.trim() ? (
                            <div className="photo-preview-wrap">
                                <img
                                    src={form.image_url}
                                    alt="Cattle preview"
                                    className="photo-preview-img"
                                />
                                <div className="photo-preview-bar">
                                    <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: 13 }}>
                                        ✅ {t('sellPage.photoSuccess')}
                                    </span>
                                    <label
                                        htmlFor="photo-upload"
                                        style={{
                                            cursor: 'pointer',
                                            color: 'var(--blue)',
                                            fontWeight: 700,
                                            fontSize: 13,
                                            textDecoration: 'underline',
                                        }}
                                    >
                                        {t('sellPage.changePhoto')}
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <label className="upload-zone-big" htmlFor="photo-upload">
                                <div className="uzb-icon">📷</div>
                                <div className="uzb-sub">{t('sellPage.photoFormat')}</div>
                                <div style={{
                                    marginTop: 12, fontSize: 13, fontWeight: 700,
                                    color: '#e63946', background: '#fff5f5',
                                    borderRadius: 8, padding: '6px 12px'
                                }}>
                                    📸 Photo required to continue
                                </div>
                            </label>
                        )}

                        {/* Image verification warning */}
                        {imageWarning && (
                            <div style={{ background: '#fff8e1', border: '1px solid #f9a825', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#856404', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                <span style={{ fontSize: 18 }}>⚠️</span>
                                <span>Please ensure the uploaded image shows a <strong>{form.category || 'matching animal'}</strong>. Mismatched images may be rejected during review.</span>
                            </div>
                        )}

                        <input
                            id="photo-upload"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            style={{ display: 'none' }}
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                // File type validation
                                const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
                                if (!validTypes.includes(file.type)) {
                                    toast.error('Only JPG, PNG, or WebP images are allowed.');
                                    return;
                                }
                                // File size validation
                                if (file.size > 5 * 1024 * 1024) {
                                    toast.error('Image too large. Max 5MB.');
                                    return;
                                }
                                // Dimension validation
                                const dimOk = await new Promise(resolve => {
                                    const img = new Image();
                                    img.onload = () => {
                                        if (img.width < 300 || img.height < 300) {
                                            toast.error('Image must be at least 300×300 pixels.');
                                            resolve(false);
                                        } else { resolve(true); }
                                    };
                                    img.onerror = () => resolve(true);
                                    img.src = URL.createObjectURL(file);
                                });
                                if (!dimOk) return;
                                const url = await uploadImage(file);
                                if (url) {
                                    setF('image_url', url);
                                    setImageWarning(true);
                                    toast.success('Photo uploaded! ✓');
                                }
                            }}
                        />

                        {/* BUG 1 Fix F — Show image validation error */}
                        {fieldErrors.image && (
                            <div style={{ color: '#e63946', fontSize: 13, marginTop: 8, textAlign: 'center' }}>
                                ⚠️ {fieldErrors.image}
                            </div>
                        )}
                        {/* BUG 1 Fix E — Skip button removed; image is mandatory */}
                    </div>
                </div>
            )}

            {/* STEP 4: Pricing */}
            {step === 4 && (
                <div className="animate-fadeIn">
                    <div className="fs ga">
                        <h3>{t('sellPage.pricingTitle')}</h3>
                        <div style={{ marginBottom: 14 }}>
                            <label className="fopt" style={{ display: 'flex', gap: 10, cursor: 'pointer' }}>
                                <input type="checkbox" checked={form.for_adoption} onChange={e => setF('for_adoption', e.target.checked)} style={{ width: 17, height: 17, accentColor: 'var(--purple)' }} />
                                <span style={{ fontWeight: 700, color: 'var(--purple)' }}>{t('sellPage.listForFreeAdoption', { defaultValue: '💜 List for Free Adoption' })}</span>
                            </label>
                        </div>
                        {!form.for_adoption && (
                            <div className="ff">
                                <label>{t('sellPage.askingPrice')}</label>
                                <input
                                    type="text"
                                    placeholder={t('sellPage.pricePlaceholder', { defaultValue: "e.g. 65,000" })}
                                    value={formatPrice(form.price)}
                                    onChange={e => {
                                        const raw = parsePrice(e.target.value);
                                        const v = Math.min(9999999, Number(raw));
                                        setF('price', v || '');
                                    }}
                                    className="starred"
                                />
                                <small style={{ fontSize: 11, color: 'var(--g3)' }}>Max ₹99,99,999</small>
                            </div>
                        )}
                    </div>
                    <div className="fs oa">
                        <h3>{t('sellPage.locationDetails')}</h3>
                        <div className="fg">
                            <div className="ff">
                                {/* BUG 6 Fix B — village is optional */}
                                <label>{t('sellPage.village')} *</label>
                                <input placeholder={t('sellPage.villagePlaceholder', { defaultValue: "e.g. Vadavalli" })} value={form.village} onChange={e => setF('village', e.target.value)} maxLength={100} />
                                {/* BUG 7 Fix D — char counter */}
                                <small style={{fontSize:11, color:'var(--g3)', textAlign:'right', display:'block'}}>{form.village.length}/100</small>
                                {fieldErrors.village && <div style={{color:'#e63946',fontSize:12,marginTop:4}}>⚠️ {fieldErrors.village}</div>}
                            </div>
                            <div className="ff">
                                {/* BUG 6 Fix B — taluk is optional */}
                                <label>{t('sellPage.taluk')} *</label>
                                <input placeholder={t('sellPage.talukPlaceholder', { defaultValue: "e.g. Coimbatore North" })} value={form.taluk} onChange={e => setF('taluk', e.target.value)} maxLength={100} />
                                <small style={{fontSize:11, color:'var(--g3)', textAlign:'right', display:'block'}}>{form.taluk.length}/100</small>
                                {fieldErrors.taluk && <div style={{color:'#e63946',fontSize:12,marginTop:4}}>⚠️ {fieldErrors.taluk}</div>}
                            </div>
                        </div>
                        <div className="fg">
                            <div className="ff">
                                <label>{t('sellPage.city')}</label>
                                <input placeholder={t('sellPage.cityPlaceholder', { defaultValue: "e.g. Coimbatore" })} value={form.location} onChange={e => setF('location', e.target.value)} maxLength={100} />
                                <small style={{fontSize:11, color:'var(--g3)', textAlign:'right', display:'block'}}>{form.location.length}/100</small>
                                {fieldErrors.location && <div style={{ color: '#e63946', fontSize: 12, marginTop: 4 }}>⚠️ {fieldErrors.location}</div>}
                            </div>
                            <div className="ff">
                                <label>{t('sellPage.landmark')} <span style={{ fontSize: 11, color: 'var(--g3)' }}>{t('sellPage.landmarkOptional')}</span></label>
                                <input placeholder={t('sellPage.landmarkPlaceholder', { defaultValue: "e.g. Near bus stand" })} value={form.landmark} onChange={e => setF('landmark', e.target.value)} maxLength={150} />
                                <small style={{fontSize:11, color:'var(--g3)', textAlign:'right', display:'block'}}>{form.landmark.length}/150</small>
                                {fieldErrors.landmark && <div style={{color:'#e63946',fontSize:12,marginTop:4}}>⚠️ {fieldErrors.landmark}</div>}
                            </div>
                        </div>
                        <div className="fg">
                            <div className="ff">
                                <label>{t('sellPage.state')}</label>
                                <select value={form.state} onChange={e => setF('state', e.target.value)}>
                                    <option value="">{t('sellPage.selectState')}</option>
                                    {INDIAN_STATES.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                {fieldErrors.state && <div style={{ color: '#e63946', fontSize: 12, marginTop: 4 }}>⚠️ {fieldErrors.state}</div>}
                            </div>
                        </div>
                    </div>


                    <div className="fs ba">
                        <h3>{t('sellPage.description')}</h3>
                        <div className="ff">
                            <textarea
                                placeholder={getDescriptionPlaceholder(form.category)}
                                value={form.description}
                                onChange={e => setF('description', e.target.value)}
                                maxLength={1000}
                                style={{ height: 120 }}
                            />
                            <div style={{ textAlign: 'right', fontSize: 11, color: form.description.length > 950 ? '#e63946' : 'var(--g3)', marginTop: 4 }}>
                                {form.description.length}/1000
                            </div>
                            {fieldErrors.description && <div style={{ color: '#e63946', fontSize: 12, marginTop: 4 }}>⚠️ {fieldErrors.description}</div>}
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="sell-nav-btns">
                {step < 4 ? (
                    <button
                        className="btn-continue"
                        disabled={!canGoNext()}
                        onClick={() => setStep(s => s + 1)}
                    >
                        {t('sellPage.continue')}
                    </button>
                ) : (
                    <button
                        className="btn-continue"
                        disabled={submitting || !canGoNext()}
                        onClick={handleSubmit}
                    >
                        {submitting ? (
                            <><span className="spinner" /> {isEditing ? t('sellPage.updatingListing') : t('sellPage.submitting')}</>
                        ) : (
                            isEditing ? t('sellPage.updateListing', { defaultValue: '🚀 Update Listing' }) : t('sellPage.publishListing', { defaultValue: '🚀 Publish Listing' })
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
