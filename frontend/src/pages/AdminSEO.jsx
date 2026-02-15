import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { Search, Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

import { BACKEND_URL } from '../config';


const DEFAULT_PAGES = [
  { slug: 'orewa-airport-shuttle', name: 'Orewa Airport Shuttle' },
  { slug: 'silverdale-airport-shuttle', name: 'Silverdale Airport Shuttle' },
  { slug: 'whangaparaoa-airport-shuttle', name: 'Whangaparaoa Airport Shuttle' },
  { slug: 'red-beach-airport-shuttle', name: 'Red Beach Airport Shuttle' },
  { slug: 'gulf-harbour-airport-shuttle', name: 'Gulf Harbour Airport Shuttle' },
  { slug: 'stanmore-bay-airport-shuttle', name: 'Stanmore Bay Airport Shuttle' },
  { slug: 'arkles-bay-airport-shuttle', name: 'Arkles Bay Airport Shuttle' },
  { slug: 'army-bay-airport-shuttle', name: 'Army Bay Airport Shuttle' },
  { slug: 'hatfields-beach-airport-shuttle', name: 'Hatfields Beach Airport Shuttle' },
  { slug: 'manly-airport-shuttle', name: 'Manly Airport Shuttle' },
  { slug: 'albany-airport-shuttle', name: 'Albany Airport Shuttle' },
  { slug: 'takapuna-airport-shuttle', name: 'Takapuna Airport Shuttle' },
  { slug: 'browns-bay-airport-shuttle', name: 'Browns Bay Airport Shuttle' },
  { slug: 'mairangi-bay-airport-shuttle', name: 'Mairangi Bay Airport Shuttle' },
  { slug: 'devonport-airport-shuttle', name: 'Devonport Airport Shuttle' },
  { slug: 'auckland-airport-transfers', name: 'Auckland Airport Transfers' },
  { slug: 'corporate-airport-transfers', name: 'Corporate Airport Transfers' },
  { slug: 'cruise-ship-transfers', name: 'Cruise Ship Transfers' },
  { slug: 'student-airport-transfers', name: 'Student Airport Transfers' },
  { slug: 'orewa-college-airport-shuttle', name: 'Orewa College Airport Shuttle' },
  { slug: 'whangaparaoa-college-airport-shuttle', name: 'Whangaparaoa College Airport Shuttle' },
  { slug: 'kingsway-school-airport-shuttle', name: 'Kingsway School Airport Shuttle' },
  { slug: 'long-bay-college-airport-shuttle', name: 'Long Bay College Airport Shuttle' },
  { slug: 'rangitoto-college-airport-shuttle', name: 'Rangitoto College Airport Shuttle' },
  // Matakana Destinations
  { slug: 'matakana-shuttle', name: 'Matakana Shuttle Service' },
  { slug: 'matakana-concert-shuttle', name: 'Matakana Concert Shuttle' },
  { slug: 'matakana-events-shuttle', name: 'Matakana Events Shuttle' },
  { slug: 'matakana-farmers-market-shuttle', name: 'Matakana Farmers Market Shuttle' },
  { slug: 'matakana-village-shuttle', name: 'Matakana Village Shuttle' },
  { slug: 'matakana-winery-shuttle', name: 'Matakana Winery Shuttle' },
  // Additional Pages
  { slug: 'faq', name: 'Frequently Asked Questions' },
  { slug: 'best-airport-shuttle-hibiscus-coast', name: 'Best Airport Shuttle Hibiscus Coast' },
  { slug: 'orewa-to-auckland-airport-shuttle', name: 'Orewa to Auckland Airport Shuttle' },
  { slug: 'early-morning-airport-shuttle', name: 'Early Morning Airport Shuttle' },
  { slug: 'business-airport-transfer', name: 'Business Airport Transfer' },
  { slug: 'hibiscus-shuttles-alternative', name: 'Hibiscus Shuttles Alternative' },
  // Phase 3: Local SEO Pages
  { slug: 'local-airport-shuttle', name: 'Local Airport Shuttle' },
  { slug: 'airport-shuttle-orewa', name: 'Airport Shuttle Orewa' },
];

const AdminSEO = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [seoPages, setSeoPages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPage, setEditingPage] = useState(null);
  const [formData, setFormData] = useState({
    page_slug: '',
    page_title: '',
    meta_description: '',
    meta_keywords: '',
    hero_heading: '',
    hero_subheading: '',
    cta_text: 'Book Now'
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchSEOPages();
  }, [navigate]);

  const fetchSEOPages = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${BACKEND_URL}/api/seo/pages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSeoPages(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
      }
      toast({ title: 'Error', description: 'Failed to fetch SEO pages', variant: 'destructive' });
    }
  };

  const handleEdit = (pageSlug) => {
    const existing = seoPages.find(p => p.page_slug === pageSlug);
    const pageName = DEFAULT_PAGES.find(p => p.slug === pageSlug)?.name || pageSlug;
    
    if (existing) {
      setFormData(existing);
    } else {
      setFormData({
        page_slug: pageSlug,
        page_title: `${pageName} | Hibiscus to Airport`,
        meta_description: `Professional airport shuttle service from ${pageName.replace(' Airport Shuttle', '')} to Auckland Airport. Reliable, affordable, and comfortable transfers.`,
        meta_keywords: `${pageName}, airport shuttle, Auckland airport, transfer service`,
        hero_heading: pageName,
        hero_subheading: 'Premium Airport Shuttle Service',
        cta_text: 'Book Now'
      });
    }
    setEditingPage(pageSlug);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      await axios.post(`${BACKEND_URL}/api/seo/pages`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast({ title: 'Success', description: 'SEO settings saved successfully' });
      setEditingPage(null);
      fetchSEOPages();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save SEO settings', variant: 'destructive' });
    }
  };

  const handleCancel = () => {
    setEditingPage(null);
    setFormData({
      page_slug: '',
      page_title: '',
      meta_description: '',
      meta_keywords: '',
      hero_heading: '',
      hero_subheading: '',
      cta_text: 'Book Now'
    });
  };

  const filteredPages = DEFAULT_PAGES.filter(page =>
    page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPageStatus = (slug) => {
    return seoPages.find(p => p.page_slug === slug) ? 'Configured' : 'Default';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO Management</h1>
          <p className="text-gray-600">Manage page titles, descriptions, and meta tags for all landing pages</p>
        </div>

        {/* Search */}
        <Card className="bg-white border border-gray-200 mb-6">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search pages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 border-gray-300"
              />
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        {editingPage && (
          <Card className="bg-white border-2 border-gold mb-6">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Editing: {DEFAULT_PAGES.find(p => p.slug === editingPage)?.name}
                </h2>
                <Button onClick={handleCancel} variant="ghost" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Page Title (appears in browser tab)
                  </label>
                  <Input
                    value={formData.page_title}
                    onChange={(e) => setFormData({ ...formData, page_title: e.target.value })}
                    placeholder="Orewa Airport Shuttle | Hibiscus to Airport"
                    className="h-12"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optimal length: 50-60 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meta Description (appears in search results)
                  </label>
                  <Textarea
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    placeholder="Professional airport shuttle service from Orewa to Auckland Airport..."
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optimal length: 150-160 characters ({formData.meta_description.length}/160)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meta Keywords (comma separated)
                  </label>
                  <Input
                    value={formData.meta_keywords}
                    onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                    placeholder="orewa, airport shuttle, auckland airport, transfer"
                    className="h-12"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hero Heading
                    </label>
                    <Input
                      value={formData.hero_heading}
                      onChange={(e) => setFormData({ ...formData, hero_heading: e.target.value })}
                      placeholder="Orewa Airport Shuttle"
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hero Subheading
                    </label>
                    <Input
                      value={formData.hero_subheading}
                      onChange={(e) => setFormData({ ...formData, hero_subheading: e.target.value })}
                      placeholder="Premium Airport Shuttle Service"
                      className="h-12"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Call-to-Action Button Text
                  </label>
                  <Input
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    placeholder="Book Now"
                    className="h-12"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    className="bg-gold hover:bg-amber-500 text-black font-semibold"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button onClick={handleCancel} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pages List */}
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Page</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">URL</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPages.map((page, index) => {
                    const status = getPageStatus(page.slug);
                    return (
                      <tr key={page.slug} className={`border-b border-gray-100 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{page.name}</div>
                        </td>
                        <td className="p-4">
                          <code className="text-sm text-gray-600">/{page.slug}</code>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            status === 'Configured'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="p-4">
                          <Button
                            onClick={() => handleEdit(page.slug)}
                            size="sm"
                            variant="outline"
                            className="border-gold text-gold hover:bg-gold hover:text-black"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit SEO
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSEO;
